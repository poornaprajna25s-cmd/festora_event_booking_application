const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Setting destination for file:', file.originalname);
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename, 'for original file:', file.originalname);
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('File filter called with file:', {
    originalname: file.originalname,
    mimetype: file.mimetype
  });
  
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    console.log('File accepted:', file.originalname);
    return cb(null, true);
  } else {
    console.log('File rejected:', file.originalname);
    cb(new Error('Only images (jpeg, jpg, png) and PDF files are allowed!'));
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// @desc    Upload file
// @route   POST /api/uploads
// @access  Organiser only
const uploadFile = (req, res) => {
  try {
    console.log('Upload request received:', {
      file: req.file,
      user: req.user ? req.user.id : 'unknown'
    });
    
    if (!req.file) {
      console.log('No file uploaded in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Determine file type
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileType = ext === '.pdf' ? 'pdf' : 'image';
    
    console.log('File uploaded successfully:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      type: fileType
    });

    res.json({
      message: 'File uploaded successfully',
      file: {
        type: fileType,
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Error in uploadFile:', error);
    res.status(500).json({ message: 'Server error during file upload' });
  }
};

module.exports = {
  upload: upload.single('file'),
  uploadFile
};