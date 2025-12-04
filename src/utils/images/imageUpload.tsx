export default async function uploadImageOnCloudinary(e) {
  try {
    const data = new FormData();
    data.append("file", e.target.files[0]);
    data.append(
      "upload_preset",
      // process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
      "x01b8cid"
    );
    data.append("cloud_name", 
      "defgskoxv"
      // process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
    );
    data.append("folder", "worklah");
    const response = await fetch(
      // `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
      `https://api.cloudinary.com/v1_1/defgskoxv/image/upload`,

      {
        method: "POST",
        body: data,
      }
    );
    const res = await response.json();
    return res.url;
  } catch (error) {
    console.error("Error uploading image: ", error);
  }
}
