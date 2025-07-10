import axios from 'axios';

const CLOUD_NAME = 'dstgg46fs';
const UPLOAD_PRESET = 'image_upload';

 // Upload image to Cloudinary
const uploadImage = async (file: File): Promise<{ url: string; public_id: string } | null> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );
    return { url: res.data.secure_url, public_id: res.data.public_id };
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return null;
  }
};

//export image url
export const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const fileInput = e.target;
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    return null;
  }

  const file = fileInput.files[0];
  const pic = await uploadImage(file);  
  return pic?.url; 
};


export const deleteImage = async (public_id: string) => {
  try {
    // Call your own backend endpoint to delete securely
    await axios.post(`/api/delete-image`, { public_id });
  } catch (err) {
    console.error('Failed to delete image:', err);
  }
};
