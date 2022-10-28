import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export function FileStorageInterceptor() {
  const dateNow = new Date(Date.now());
  const year = dateNow.getFullYear();
  const month = dateNow.getMonth();

  const dirDestination = `./uploads/${year}/${month}/`;
  return FileInterceptor('file', {
    storage: diskStorage({
      destination: dirDestination,
      filename: (req, file, cb) => {
        // Generating a 32 random chars long string
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');

        //Calling the callback passing the random name generated with the original extension name
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  });
}
