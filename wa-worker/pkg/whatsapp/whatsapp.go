package whatsapp

import (
	"bytes"
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"strings"

	webp "github.com/nickalie/go-webpbin"
	"github.com/sunshineplan/imgconv"

	qrCode "github.com/skip2/go-qrcode"
	"google.golang.org/protobuf/proto"

	"go.mau.fi/whatsmeow"
	waproto "go.mau.fi/whatsmeow/binary/proto"
	"go.mau.fi/whatsmeow/store"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"

	"wa-worker/pkg/env"
	"wa-worker/pkg/log"

	jsonHelper "wa-worker/internal/utils"
)

var WhatsAppDatastore *sqlstore.Container
var WhatsAppClient = make(map[string]*whatsmeow.Client)

func init() {
	var err error

	dbType, err := env.GetEnvString("WHATSAPP_DATASTORE_TYPE")
	if err != nil {
		log.Print(nil).Fatal("error Parse Environment Variable for WhatsApp Client Datastore Type")
	}

	dbURI, err := env.GetEnvString("WHATSAPP_DATASTORE_URI")
	if err != nil {
		log.Print(nil).Fatal("error Parse Environment Variable for WhatsApp Client Datastore URI")
	}

	datastore, err := sqlstore.New(dbType, dbURI, nil)
	if err != nil {
		log.Print(nil).Fatal("error Connect WhatsApp Client Datastore")
	}

	WhatsAppDatastore = datastore
}

func HookToBEAfterBuilt() {
	port, _ := env.GetEnvString("SERVER_PORT")

	log.Print(nil).Info("hook to BE ", port)
	var bodyValues map[string]interface{}
	bodyValues = map[string]interface{}{
		"port": port,
	}
	body := jsonHelper.MakeJsonBody(bodyValues)
	url, _ := env.GetEnvString("BE_API_HOOK_URL")
	log.Print(nil).Info("hook to BE : ", port, url)
	_, err := http.Post(url+"/worker/init", "application/json", body)
	if err != nil {
		log.Print(nil).Error(err)
	}
}

func WhatsappEventHandler(evt interface{}) {
	switch v := evt.(type) {
	case *events.Message:

		fmt.Println("-------------------------------------------0")
		fmt.Println("GetConversation : ", v.Message.GetConversation())
		fmt.Println("Sender : ", v.Info.Sender)
		fmt.Println("Sender Number : ", v.Info.Sender.User)
		fmt.Println("IsGroup : ", v.Info.IsGroup)
		fmt.Println("MessageSource : ", v.Info.MessageSource)
		fmt.Println("ID : ", v.Info.ID)
		fmt.Println("PushName : ", v.Info.PushName)
		fmt.Println("BroadcastListOwner : ", v.Info.BroadcastListOwner)
		fmt.Println("Category : ", v.Info.Category)
		fmt.Println("Chat : ", v.Info.Chat)
		fmt.Println("DeviceSentMeta : ", v.Info.DeviceSentMeta)
		fmt.Println("IsFromMe : ", v.Info.IsFromMe)
		fmt.Println("MediaType : ", v.Info.MediaType)
		fmt.Println("Multicast : ", v.Info.Multicast)
		fmt.Println("Info.Chat.Server : ", v.Info.Chat.Server)
		fmt.Println("-------------------------------------xxxxxxxx")
		fmt.Println("")

		if v.Info.IsGroup {
			// TODO : group implementation
		} else {

			port, _ := env.GetEnvString("SERVER_PORT")
			var bodyValues map[string]interface{}
			bodyValues = map[string]interface{}{
				"id":          v.Info.ID,
				"contact":     v.Info.Chat.User,
				"port":        port,
				"message":     v.Message.GetConversation(),
				"mediaType":   v.Info.MediaType,
				"isFromMe":    v.Info.IsFromMe,
				"isFromGroup": v.Info.IsGroup,
			}
			body := jsonHelper.MakeJsonBody(bodyValues)
			url, _ := env.GetEnvString("BE_API_HOOK_URL")
			_, err := http.Post(url+"/message/receive", "application/json", body)

			if err != nil {
				log.Print(nil).Error(err)
			}
		}

	}

}

func WhatsAppInitClient(device *store.Device, jid string) {
	var err error

	if WhatsAppClient[jid] == nil {
		if device == nil {
			// Initialize New WhatsApp Client Device in Datastore
			device = WhatsAppDatastore.NewDevice()
		}

		// Set Client Properties
		devicePropTitle, _ := env.GetEnvString("WHATSAPP_PROP_TITLE")
		store.DeviceProps.Os = proto.String(devicePropTitle)
		store.DeviceProps.PlatformType = waproto.DeviceProps_DESKTOP.Enum()
		store.DeviceProps.RequireFullSync = proto.Bool(false)

		// Set Client Versions
		version.Major, err = env.GetEnvInt("WHATSAPP_VERSION_MAJOR")
		if err == nil {
			store.DeviceProps.Version.Primary = proto.Uint32(uint32(version.Major))
		}
		version.Minor, err = env.GetEnvInt("WHATSAPP_VERSION_MINOR")
		if err == nil {
			store.DeviceProps.Version.Secondary = proto.Uint32(uint32(version.Minor))
		}
		version.Patch, err = env.GetEnvInt("WHATSAPP_VERSION_PATCH")
		if err == nil {
			store.DeviceProps.Version.Tertiary = proto.Uint32(uint32(version.Patch))
		}

		// Initialize New WhatsApp Client
		// And Save it to The Map
		WhatsAppClient[jid] = whatsmeow.NewClient(device, nil)
		WhatsAppClient[jid].AddEventHandler(WhatsappEventHandler)

		// Set WhatsApp Client Auto Reconnect
		WhatsAppClient[jid].EnableAutoReconnect = true

		// Set WhatsApp Client Auto Trust Identity
		WhatsAppClient[jid].AutoTrustIdentity = true
	}
}

func WhatsAppGenerateQR(qrChan <-chan whatsmeow.QRChannelItem) (string, int) {
	qrChanCode := make(chan string)
	qrChanTimeout := make(chan int)

	// Get QR Code Data and Timeout
	go func() {
		for evt := range qrChan {
			if evt.Event == "code" {
				qrChanCode <- evt.Code
				qrChanTimeout <- int(evt.Timeout.Seconds())
			}
		}
	}()

	// Generate QR Code Data to PNG Image
	qrTemp := <-qrChanCode
	qrPNG, _ := qrCode.Encode(qrTemp, qrCode.Medium, 256)

	// Return QR Code PNG in Base64 Format and Timeout Information
	return base64.StdEncoding.EncodeToString(qrPNG), <-qrChanTimeout
}

func WhatsAppLogin(jid string) (string, int, error) {
	if WhatsAppClient[jid] != nil {
		// Make Sure WebSocket Connection is Disconnected
		WhatsAppClient[jid].Disconnect()

		if WhatsAppClient[jid].Store.ID == nil {
			// Device ID is not Exist
			// Generate QR Code
			qrChanGenerate, _ := WhatsAppClient[jid].GetQRChannel(context.Background())

			// Connect WebSocket while Initialize QR Code Data to be Sent
			err := WhatsAppClient[jid].Connect()
			if err != nil {
				return "", 0, err
			}

			// Set WhatsApp Client Presence to Available
			_ = WhatsAppClient[jid].SendPresence(types.PresenceAvailable)

			// Get Generated QR Code and Timeout Information
			qrImage, qrTimeout := WhatsAppGenerateQR(qrChanGenerate)

			// Return QR Code in Base64 Format and Timeout Information
			return "data:image/png;base64," + qrImage, qrTimeout, nil
		} else {
			// Device ID is Exist
			// Reconnect WebSocket
			err := WhatsAppReconnect(jid)
			if err != nil {
				return "", 0, err
			}

			return "WhatsApp Client is Reconnected", 0, nil
		}
	}

	// Return Error WhatsApp Client is not Valid
	return "", 0, errors.New("WhatsApp Client is not Valid")
}

func WhatsAppReconnect(jid string) error {
	if WhatsAppClient[jid] != nil {
		// Make Sure WebSocket Connection is Disconnected
		WhatsAppClient[jid].Disconnect()

		// Make Sure Store ID is not Empty
		// To do Reconnection
		if WhatsAppClient[jid] != nil {
			err := WhatsAppClient[jid].Connect()
			if err != nil {
				return err
			}

			// Set WhatsApp Client Presence to Available
			_ = WhatsAppClient[jid].SendPresence(types.PresenceAvailable)

			return nil
		}

		return errors.New("WhatsApp Client Store ID is Empty, Please Re-Login and Scan QR Code Again")
	}

	return errors.New("WhatsApp Client is not Valid")
}

func WhatsAppLogout(jid string) error {
	if WhatsAppClient[jid] != nil {
		// Make Sure Store ID is not Empty
		if WhatsAppClient[jid] != nil {
			var err error

			// Set WhatsApp Client Presence to Unavailable
			_ = WhatsAppClient[jid].SendPresence(types.PresenceUnavailable)

			// Logout WhatsApp Client and Disconnect from WebSocket
			err = WhatsAppClient[jid].Logout()
			if err != nil {
				// Force Disconnect
				WhatsAppClient[jid].Disconnect()

				// Manually Delete Device from Datastore Store
				err = WhatsAppClient[jid].Store.Delete()
				if err != nil {
					return err
				}
			}

			// Free WhatsApp Client Map
			WhatsAppClient[jid] = nil
			delete(WhatsAppClient, jid)

			return nil
		}

		return errors.New("WhatsApp Client Store ID is Empty, Please Re-Login and Scan QR Code Again")
	}

	// Return Error WhatsApp Client is not Valid
	return errors.New("WhatsApp Client is not Valid")
}

func WhatsAppIsClientOK(jid string) error {
	// Make Sure WhatsApp Client is Connected
	if !WhatsAppClient[jid].IsConnected() {
		return errors.New("WhatsApp Client is not Connected")
	}

	// Make Sure WhatsApp Client is Logged In
	if !WhatsAppClient[jid].IsLoggedIn() {
		return errors.New("WhatsApp Client is not Logged In")
	}

	return nil
}

func WhatsAppGetJID(jid string, id string) types.JID {
	if WhatsAppClient[jid] != nil {
		var ids []string

		ids = append(ids, "+"+id)
		infos, err := WhatsAppClient[jid].IsOnWhatsApp(ids)
		if err == nil {
			// If WhatsApp ID is Registered Then
			// Return ID Information
			if infos[0].IsIn {
				return infos[0].JID
			}
		}
	}

	// Return Empty ID Information
	return types.EmptyJID
}

func WhatsAppComposeJID(id string) types.JID {
	// Decompose WhatsApp ID First Before Recomposing
	id = WhatsAppDecomposeJID(id)

	// Check if ID is Group or Not By Detecting '-' for Old Group ID
	// Or By ID Length That Should be 18 Digits or More
	if strings.ContainsRune(id, '-') || len(id) >= 18 {
		// Return New Group User JID
		return types.NewJID(id, types.GroupServer)
	}

	// Return New Standard User JID
	return types.NewJID(id, types.DefaultUserServer)
}

func WhatsAppDecomposeJID(id string) string {
	// Check if WhatsApp ID Contains '@' Symbol
	if strings.ContainsRune(id, '@') {
		// Split WhatsApp ID Based on '@' Symbol
		// and Get Only The First Section Before The Symbol
		buffers := strings.Split(id, "@")
		id = buffers[0]
	}

	// Check if WhatsApp ID First Character is '+' Symbol
	if id[0] == '+' {
		// Remove '+' Symbol from WhatsApp ID
		id = id[1:]
	}

	return id
}

func WhatsAppComposeStatus(jid string, rjid types.JID, isComposing bool, isAudio bool) {
	// Set Compose Status
	var typeCompose types.ChatPresence
	if isComposing {
		typeCompose = types.ChatPresenceComposing
	} else {
		typeCompose = types.ChatPresencePaused
	}

	// Set Compose Media Audio (Recording) or Text (Typing)
	var typeComposeMedia types.ChatPresenceMedia
	if isAudio {
		typeComposeMedia = types.ChatPresenceMediaAudio
	} else {
		typeComposeMedia = types.ChatPresenceMediaText
	}

	// Send Chat Compose Status
	_ = WhatsAppClient[jid].SendChatPresence(rjid, typeCompose, typeComposeMedia)
}

func WhatsAppSendText(ctx context.Context, jid string, rjid string, message string) (string, error) {
	if WhatsAppClient[jid] != nil {
		var err error

		// Make Sure WhatsApp Client is OK
		err = WhatsAppIsClientOK(jid)
		if err != nil {
			return "", err
		}

		// Compose New Remote JID
		remoteJID := WhatsAppComposeJID(rjid)

		// Set Chat Presence
		WhatsAppComposeStatus(jid, remoteJID, true, false)
		defer WhatsAppComposeStatus(jid, remoteJID, false, false)

		// Compose WhatsApp Proto
		msgId := whatsmeow.GenerateMessageID()
		msgContent := &waproto.Message{
			Conversation: proto.String(message),
		}

		// Send WhatsApp Message Proto
		_, err = WhatsAppClient[jid].SendMessage(ctx, remoteJID, msgContent)
		if err != nil {
			return "", err
		}

		return msgId, nil
	}

	// Return Error WhatsApp Client is not Valid
	return "", errors.New("WhatsApp Client is not Valid")
}

func WhatsAppSendLocation(ctx context.Context, jid string, rjid string, latitude float64, longitude float64) (string, error) {
	if WhatsAppClient[jid] != nil {
		var err error

		// Make Sure WhatsApp Client is OK
		err = WhatsAppIsClientOK(jid)
		if err != nil {
			return "", err
		}

		// Compose New Remote JID
		remoteJID := WhatsAppComposeJID(rjid)

		// Set Chat Presence
		WhatsAppComposeStatus(jid, remoteJID, true, false)
		defer WhatsAppComposeStatus(jid, remoteJID, false, false)

		// Compose WhatsApp Proto
		msgId := whatsmeow.GenerateMessageID()
		msgContent := &waproto.Message{
			LocationMessage: &waproto.LocationMessage{
				DegreesLatitude:  proto.Float64(latitude),
				DegreesLongitude: proto.Float64(longitude),
			},
		}

		// Send WhatsApp Message Proto
		_, err = WhatsAppClient[jid].SendMessage(ctx, remoteJID, msgContent)
		if err != nil {
			return "", err
		}

		return msgId, nil
	}

	// Return Error WhatsApp Client is not Valid
	return "", errors.New("WhatsApp Client is not Valid")
}

func WhatsAppSendDocument(ctx context.Context, jid string, rjid string, fileBytes []byte, fileType string, fileName string) (string, error) {
	if WhatsAppClient[jid] != nil {
		var err error

		// Make Sure WhatsApp Client is OK
		err = WhatsAppIsClientOK(jid)
		if err != nil {
			return "", err
		}

		// Compose New Remote JID
		remoteJID := WhatsAppComposeJID(rjid)

		// Set Chat Presence
		WhatsAppComposeStatus(jid, remoteJID, true, false)
		defer WhatsAppComposeStatus(jid, remoteJID, false, false)

		// Upload File to WhatsApp Storage Server
		fileUploaded, err := WhatsAppClient[jid].Upload(ctx, fileBytes, whatsmeow.MediaDocument)
		if err != nil {
			return "", errors.New("error While Uploading Media to WhatsApp Server")
		}

		// Compose WhatsApp Proto
		msgId := whatsmeow.GenerateMessageID()
		msgContent := &waproto.Message{
			DocumentMessage: &waproto.DocumentMessage{
				Url:           proto.String(fileUploaded.URL),
				DirectPath:    proto.String(fileUploaded.DirectPath),
				Mimetype:      proto.String(fileType),
				Title:         proto.String(fileName),
				FileName:      proto.String(fileName),
				FileLength:    proto.Uint64(fileUploaded.FileLength),
				FileSha256:    fileUploaded.FileSHA256,
				FileEncSha256: fileUploaded.FileEncSHA256,
				MediaKey:      fileUploaded.MediaKey,
			},
		}

		// Send WhatsApp Message Proto
		_, err = WhatsAppClient[jid].SendMessage(ctx, remoteJID,  msgContent)
		if err != nil {
			return "", err
		}

		return msgId, nil
	}

	// Return Error WhatsApp Client is not Valid
	return "", errors.New("WhatsApp Client is not Valid")
}

func WhatsAppSendImage(ctx context.Context, jid string, rjid string, imageBytes []byte, imageType string, imageCaption string, isViewOnce bool) (string, error) {
	if WhatsAppClient[jid] != nil {
		var err error

		// Make Sure WhatsApp Client is OK
		err = WhatsAppIsClientOK(jid)
		if err != nil {
			return "", err
		}

		// Compose New Remote JID
		remoteJID := WhatsAppComposeJID(rjid)

		// Set Chat Presence
		WhatsAppComposeStatus(jid, remoteJID, true, false)
		defer WhatsAppComposeStatus(jid, remoteJID, false, false)

		// Issue #7 Old Version Client Cannot Render WebP Format
		// If MIME Type is "image/webp" Then Convert it as PNG
		isWhatsAppImageConvertWebP, err := env.GetEnvBool("WHATSAPP_MEDIA_IMAGE_CONVERT_WEBP")
		if err != nil {
			isWhatsAppImageConvertWebP = false
		}

		if imageType == "image/webp" && isWhatsAppImageConvertWebP {
			imgConvDecode, err := imgconv.Decode(bytes.NewReader(imageBytes))
			if err != nil {
				return "", errors.New("error While Decoding Convert Image Stream")
			}

			imgConvEncode := new(bytes.Buffer)
			err = imgconv.Write(imgConvEncode, imgConvDecode, &imgconv.FormatOption{Format: imgconv.PNG})
			if err != nil {
				return "", errors.New("error While Encoding Convert Image Stream")
			}

			imageBytes = imgConvEncode.Bytes()
			imageType = "image/png"
		}

		// If WhatsApp Media Compression Enabled
		// Then Resize The Image to Width 1024px and Preserve Aspect Ratio
		isWhatsAppImageCompression, err := env.GetEnvBool("WHATSAPP_MEDIA_IMAGE_COMPRESSION")
		if err != nil {
			isWhatsAppImageCompression = false
		}

		if isWhatsAppImageCompression {
			imgResizeDecode, err := imgconv.Decode(bytes.NewReader(imageBytes))
			if err != nil {
				return "", errors.New("error While Decoding Resize Image Stream")
			}

			imgResizeEncode := new(bytes.Buffer)

			err = imgconv.Write(imgResizeEncode,
				imgconv.Resize(imgResizeDecode, &imgconv.ResizeOption{Width: 1024}),
				&imgconv.FormatOption{})

			if err != nil {
				return "", errors.New("error While Encoding Resize Image Stream")
			}

			imageBytes = imgResizeEncode.Bytes()
		}

		// Creating Image JPEG Thumbnail
		// With Permanent Width 640px and Preserve Aspect Ratio
		imgThumbDecode, err := imgconv.Decode(bytes.NewReader(imageBytes))
		if err != nil {
			return "", errors.New("error While Decoding Thumbnail Image Stream")
		}

		imgThumbEncode := new(bytes.Buffer)

		err = imgconv.Write(imgThumbEncode,
			imgconv.Resize(imgThumbDecode, &imgconv.ResizeOption{Width: 640}),
			&imgconv.FormatOption{Format: imgconv.JPEG})

		if err != nil {
			return "", errors.New("error While Encoding Thumbnail Image Stream")
		}

		// Upload Image to WhatsApp Storage Server
		imageUploaded, err := WhatsAppClient[jid].Upload(ctx, imageBytes, whatsmeow.MediaImage)
		if err != nil {
			return "", errors.New("error While Uploading Media to WhatsApp Server")
		}

		// Compose WhatsApp Proto
		msgId := whatsmeow.GenerateMessageID()
		msgContent := &waproto.Message{
			ImageMessage: &waproto.ImageMessage{
				Url:           proto.String(imageUploaded.URL),
				DirectPath:    proto.String(imageUploaded.DirectPath),
				Mimetype:      proto.String(imageType),
				Caption:       proto.String(imageCaption),
				FileLength:    proto.Uint64(imageUploaded.FileLength),
				FileSha256:    imageUploaded.FileSHA256,
				FileEncSha256: imageUploaded.FileEncSHA256,
				MediaKey:      imageUploaded.MediaKey,
				JpegThumbnail: imgThumbEncode.Bytes(),
				ViewOnce:      proto.Bool(isViewOnce),
			},
		}

		// Send WhatsApp Message Proto
		_, err = WhatsAppClient[jid].SendMessage(ctx, remoteJID,  msgContent)
		if err != nil {
			return "", err
		}

		return msgId, nil
	}

	// Return Error WhatsApp Client is not Valid
	return "", errors.New("WhatsApp Client is not Valid")
}

func WhatsAppSendAudio(ctx context.Context, jid string, rjid string, audioBytes []byte, audioType string) (string, error) {
	if WhatsAppClient[jid] != nil {
		var err error

		// Make Sure WhatsApp Client is OK
		err = WhatsAppIsClientOK(jid)
		if err != nil {
			return "", err
		}

		// Compose New Remote JID
		remoteJID := WhatsAppComposeJID(rjid)

		// Set Chat Presence
		WhatsAppComposeStatus(jid, remoteJID, true, true)
		defer WhatsAppComposeStatus(jid, remoteJID, false, true)

		// Upload Audio to WhatsApp Storage Server
		audioUploaded, err := WhatsAppClient[jid].Upload(ctx, audioBytes, whatsmeow.MediaAudio)
		if err != nil {
			return "", errors.New("error While Uploading Media to WhatsApp Server")
		}

		// Compose WhatsApp Proto
		msgId := whatsmeow.GenerateMessageID()
		msgContent := &waproto.Message{
			AudioMessage: &waproto.AudioMessage{
				Url:           proto.String(audioUploaded.URL),
				DirectPath:    proto.String(audioUploaded.DirectPath),
				Mimetype:      proto.String(audioType),
				FileLength:    proto.Uint64(audioUploaded.FileLength),
				FileSha256:    audioUploaded.FileSHA256,
				FileEncSha256: audioUploaded.FileEncSHA256,
				MediaKey:      audioUploaded.MediaKey,
			},
		}

		// Send WhatsApp Message Proto
		_, err = WhatsAppClient[jid].SendMessage(ctx, remoteJID,  msgContent)
		if err != nil {
			return "", err
		}

		return msgId, nil
	}

	// Return Error WhatsApp Client is not Valid
	return "", errors.New("WhatsApp Client is not Valid")
}

func WhatsAppSendVideo(ctx context.Context, jid string, rjid string, videoBytes []byte, videoType string, videoCaption string, isViewOnce bool) (string, error) {
	if WhatsAppClient[jid] != nil {
		var err error

		// Make Sure WhatsApp Client is OK
		err = WhatsAppIsClientOK(jid)
		if err != nil {
			return "", err
		}

		// Compose New Remote JID
		remoteJID := WhatsAppComposeJID(rjid)

		// Set Chat Presence
		WhatsAppComposeStatus(jid, remoteJID, true, false)
		defer WhatsAppComposeStatus(jid, remoteJID, false, false)

		// Upload Video to WhatsApp Storage Server
		videoUploaded, err := WhatsAppClient[jid].Upload(ctx, videoBytes, whatsmeow.MediaVideo)
		if err != nil {
			return "", errors.New("error While Uploading Media to WhatsApp Server")
		}

		// Compose WhatsApp Proto
		msgId := whatsmeow.GenerateMessageID()
		msgContent := &waproto.Message{
			VideoMessage: &waproto.VideoMessage{
				Url:           proto.String(videoUploaded.URL),
				DirectPath:    proto.String(videoUploaded.DirectPath),
				Mimetype:      proto.String(videoType),
				Caption:       proto.String(videoCaption),
				FileLength:    proto.Uint64(videoUploaded.FileLength),
				FileSha256:    videoUploaded.FileSHA256,
				FileEncSha256: videoUploaded.FileEncSHA256,
				MediaKey:      videoUploaded.MediaKey,
				ViewOnce:      proto.Bool(isViewOnce),
			},
		}

		// Send WhatsApp Message Proto
		_, err = WhatsAppClient[jid].SendMessage(ctx, remoteJID,  msgContent)
		if err != nil {
			return "", err
		}

		return msgId, nil
	}

	// Return Error WhatsApp Client is not Valid
	return "", errors.New("WhatsApp Client is not Valid")
}

func WhatsAppSendContact(ctx context.Context, jid string, rjid string, contactName string, contactNumber string) (string, error) {
	if WhatsAppClient[jid] != nil {
		var err error

		// Make Sure WhatsApp Client is OK
		err = WhatsAppIsClientOK(jid)
		if err != nil {
			return "", err
		}

		// Compose New Remote JID
		remoteJID := WhatsAppComposeJID(rjid)

		// Set Chat Presence
		WhatsAppComposeStatus(jid, remoteJID, true, false)
		defer WhatsAppComposeStatus(jid, remoteJID, false, false)

		// Compose WhatsApp Proto
		msgId := whatsmeow.GenerateMessageID()
		msgVCard := fmt.Sprintf("BEGIN:VCARD\nVERSION:3.0\nN:;%v;;;\nFN:%v\nTEL;type=CELL;waid=%v:+%v\nEND:VCARD",
			contactName, contactName, contactNumber, contactNumber)
		msgContent := &waproto.Message{
			ContactMessage: &waproto.ContactMessage{
				DisplayName: proto.String(contactName),
				Vcard:       proto.String(msgVCard),
			},
		}

		// Send WhatsApp Message Proto
		_, err = WhatsAppClient[jid].SendMessage(ctx, remoteJID,  msgContent)
		if err != nil {
			return "", err
		}

		return msgId, nil
	}

	// Return Error WhatsApp Client is not Valid
	return "", errors.New("WhatsApp Client is not Valid")
}

func WhatsAppSendLink(ctx context.Context, jid string, rjid string, linkCaption string, linkURL string) (string, error) {
	if WhatsAppClient[jid] != nil {
		var err error

		// Make Sure WhatsApp Client is OK
		err = WhatsAppIsClientOK(jid)
		if err != nil {
			return "", err
		}

		// Compose New Remote JID
		remoteJID := WhatsAppComposeJID(rjid)

		// Set Chat Presence
		WhatsAppComposeStatus(jid, remoteJID, true, false)
		defer WhatsAppComposeStatus(jid, remoteJID, false, false)

		// Compose WhatsApp Proto
		msgId := whatsmeow.GenerateMessageID()
		msgCaption := "Open Link"
		msgText := linkURL

		if len(strings.TrimSpace(linkCaption)) > 0 {
			msgCaption = linkCaption
			msgText = fmt.Sprintf("%s\n%s", linkCaption, linkURL)
		}

		msgContent := &waproto.Message{
			ExtendedTextMessage: &waproto.ExtendedTextMessage{
				Text:         proto.String(msgText),
				CanonicalUrl: proto.String(linkURL),
				ContextInfo: &waproto.ContextInfo{
					ActionLink: &waproto.ActionLink{
						Url:         proto.String(linkURL),
						ButtonTitle: proto.String(msgCaption),
					},
				},
			},
		}

		// Send WhatsApp Message Proto
		_, err = WhatsAppClient[jid].SendMessage(ctx, remoteJID,  msgContent)
		if err != nil {
			return "", err
		}

		return msgId, nil
	}

	// Return Error WhatsApp Client is not Valid
	return "", errors.New("WhatsApp Client is not Valid")
}

func WhatsAppSendSticker(ctx context.Context, jid string, rjid string, stickerBytes []byte) (string, error) {
	if WhatsAppClient[jid] != nil {
		var err error

		// Make Sure WhatsApp Client is OK
		err = WhatsAppIsClientOK(jid)
		if err != nil {
			return "", err
		}

		// Compose New Remote JID
		remoteJID := WhatsAppComposeJID(rjid)

		// Set Chat Presence
		WhatsAppComposeStatus(jid, remoteJID, true, false)
		defer WhatsAppComposeStatus(jid, remoteJID, false, false)

		stickerConvDecode, err := imgconv.Decode(bytes.NewReader(stickerBytes))
		if err != nil {
			return "", errors.New("error While Decoding Convert Sticker Stream")
		}

		stickerConvResize := imgconv.Resize(stickerConvDecode, &imgconv.ResizeOption{Width: 512, Height: 512})
		stickerConvEncode := new(bytes.Buffer)

		err = webp.Encode(stickerConvEncode, stickerConvResize)
		if err != nil {
			return "", errors.New("error While Encoding Convert Sticker Stream")
		}

		stickerBytes = stickerConvEncode.Bytes()

		// Upload Image to WhatsApp Storage Server
		stickerUploaded, err := WhatsAppClient[jid].Upload(ctx, stickerBytes, whatsmeow.MediaImage)
		if err != nil {
			return "", errors.New("error While Uploading Media to WhatsApp Server")
		}

		// Compose WhatsApp Proto
		msgId := whatsmeow.GenerateMessageID()
		msgContent := &waproto.Message{
			StickerMessage: &waproto.StickerMessage{
				Url:           proto.String(stickerUploaded.URL),
				DirectPath:    proto.String(stickerUploaded.DirectPath),
				Mimetype:      proto.String("image/webp"),
				FileLength:    proto.Uint64(stickerUploaded.FileLength),
				FileSha256:    stickerUploaded.FileSHA256,
				FileEncSha256: stickerUploaded.FileEncSHA256,
				MediaKey:      stickerUploaded.MediaKey,
			},
		}

		// Send WhatsApp Message Proto
		_, err = WhatsAppClient[jid].SendMessage(ctx, remoteJID,  msgContent)
		if err != nil {
			return "", err
		}

		return msgId, nil
	}

	// Return Error WhatsApp Client is not Valid
	return "", errors.New("WhatsApp Client is not Valid")
}

func WhatsAppGetGroup(jid string) ([]types.GroupInfo, error) {
	if WhatsAppClient[jid] != nil {
		var err error

		// Make Sure WhatsApp Client is OK
		err = WhatsAppIsClientOK(jid)
		if err != nil {
			return nil, err
		}

		// Get Joined Group List
		groups, err := WhatsAppClient[jid].GetJoinedGroups()
		if err != nil {
			return nil, err
		}

		// Put Group Information in List
		var gids []types.GroupInfo
		for _, group := range groups {
			gids = append(gids, *group)
		}

		// Return Group Information List
		return gids, nil
	}

	// Return Error WhatsApp Client is not Valid
	return nil, errors.New("WhatsApp Client is not Valid")
}
