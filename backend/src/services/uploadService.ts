import cloudinary from "../config/cloudinaryConfig.js";
import sharp from "sharp";

interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

// generate folder based on purpose of files
const getFolder = (mimeType: string, type?: string): string => {
  if (type === "avatar") return "chatter/avatars";
  if (mimeType.startsWith("image/")) return "chatter/images";
  if (
    mimeType === "application/pdf" ||
    mimeType.includes("word") ||
    mimeType === "text/plain"
  )
    return "chatter/documents";
  return "chatter/misc";
};

export const uploadFile = async (
  files: Express.Multer.File[],
  type?: string,
): Promise<UploadResult[]> => {
  return Promise.all(
    files.map(async (file) => {
      let buffer = file.buffer;
      let mimeType = file.mimetype;

      // compress image with sharp before upload
      if (file.mimetype.startsWith("image/")) {
        buffer = await sharp(file.buffer)
          .resize({
            width: 1920,
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toBuffer();
        mimeType = "image/webp";
      }

      // upload to cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        const folder = getFolder(mimeType, type);
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
              folder: folder,
              quality: "auto",
              fetch_format: "auto",
              ...(type === "avatar" && {
                transformation: [
                  {
                    width: 400,
                    height: 400,
                    crop: "fill",
                    gravity: "face",
                  },
                ],
              }),
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            },
          )
          .end(buffer);
      });

      return {
        url: result.secure_url,
        fileName: file.originalname,
        fileSize: buffer.length,
        fileType: mimeType,
      };
    }),
  );
};
