import { Request, RequestHandler } from "express";
import formidable from "formidable";

export interface RequestWithFiles extends Request {
  files?: formidable.Files;
}

const fileParser: RequestHandler = (req: RequestWithFiles, res, next) => {
  if (!req.headers["content-type"]?.startsWith("multipart/form-data;")) return res.status(422).json({ error: "Error with content type header" });

  const form = formidable({ multiples: false });

  form.parse(req, (err, fields, files) => {
    if (err) return next(err);
    req.body = fields;
    req.files = files;
    next();
  });
};

export default fileParser;