import PropTypes from 'prop-types';

import UploadMultiFiles from 'src/components/upload-files/UploadMultiFiles';

export default function UploadUtilityBills({ setData }) {
  const acceptedFiles = {
    'image/png': ['.jpg', '.jpeg'],
    'application/pdf': ['.pdf'],
  };

  const onUpload = async (files) => {
    console.log(files);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/formRecognizer', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.json();
        // setData(responseData.documentResponses)
        console.log('Response data:', responseData);
      } else {
        const responseData = await response.json();
        console.log(responseData);
      }
    } catch (err) {
      console.error('Error uploading files:', err);
    }
  };

  return <UploadMultiFiles onUpload={onUpload} accept={acceptedFiles} />;
}

UploadUtilityBills.propTypes = {
  setData: PropTypes.func,
};
