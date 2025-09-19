const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, `${uniqueId}${fileExtension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1 // Only one file at a time
  }
});

// @route   POST /api/uploads/image
// @desc    Upload and process rooftop image
// @access  Public
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const originalPath = req.file.path;
    const filename = req.file.filename;
    const nameWithoutExt = path.parse(filename).name;
    
    // Create processed versions
    const processedImages = {
      original: filename,
      thumbnail: `${nameWithoutExt}_thumb.jpg`,
      optimized: `${nameWithoutExt}_opt.jpg`
    };

    try {
      // Create thumbnail (300x300)
      await sharp(originalPath)
        .resize(300, 300, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(path.join(uploadDir, processedImages.thumbnail));

      // Create optimized version (1200x800)
      await sharp(originalPath)
        .resize(1200, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toFile(path.join(uploadDir, processedImages.optimized));

      // Get image metadata
      const metadata = await sharp(originalPath).metadata();

      res.json({
        success: true,
        message: 'Image uploaded and processed successfully',
        data: {
          original: {
            filename: processedImages.original,
            url: `/uploads/${processedImages.original}`,
            size: req.file.size,
            mimetype: req.file.mimetype
          },
          thumbnail: {
            filename: processedImages.thumbnail,
            url: `/uploads/${processedImages.thumbnail}`,
            size: '300x300'
          },
          optimized: {
            filename: processedImages.optimized,
            url: `/uploads/${processedImages.optimized}`,
            maxSize: '1200x800'
          },
          metadata: {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            channels: metadata.channels,
            hasAlpha: metadata.hasAlpha
          }
        }
      });

    } catch (processingError) {
      console.error('Image processing error:', processingError);
      
      // Return original file info if processing fails
      res.json({
        success: true,
        message: 'Image uploaded successfully (processing failed)',
        warning: 'Image processing failed, only original file available',
        data: {
          original: {
            filename: processedImages.original,
            url: `/uploads/${processedImages.original}`,
            size: req.file.size,
            mimetype: req.file.mimetype
          }
        }
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if it was created
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Upload failed'
    });
  }
});

// @route   DELETE /api/uploads/:filename
// @desc    Delete uploaded file and its processed versions
// @access  Public
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename (basic security check)
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const filePath = path.join(uploadDir, filename);
    const nameWithoutExt = path.parse(filename).name;
    
    // Files to delete (original and processed versions)
    const filesToDelete = [
      filename, // original
      `${nameWithoutExt}_thumb.jpg`, // thumbnail
      `${nameWithoutExt}_opt.jpg` // optimized
    ];

    let deletedFiles = [];
    let errors = [];

    for (const file of filesToDelete) {
      const fullPath = path.join(uploadDir, file);
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          deletedFiles.push(file);
        }
      } catch (error) {
        errors.push({ file, error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'File deletion completed',
      data: {
        deletedFiles,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Delete failed'
    });
  }
});

// @route   GET /api/uploads/info/:filename
// @desc    Get information about uploaded file
// @access  Public
router.get('/info/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const filePath = path.join(uploadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const stats = fs.statSync(filePath);
    
    // Try to get image metadata if it's an image
    let metadata = null;
    try {
      if (filename.match(/\.(jpg|jpeg|png|webp|tiff|gif)$/i)) {
        metadata = await sharp(filePath).metadata();
      }
    } catch (metadataError) {
      console.warn('Failed to get image metadata:', metadataError.message);
    }

    res.json({
      success: true,
      data: {
        filename,
        url: `/uploads/${filename}`,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        metadata
      }
    });

  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file information',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Info retrieval failed'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large',
        maxSize: `${(parseInt(process.env.MAX_FILE_SIZE) || 10485760) / 1024 / 1024}MB`
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed',
      acceptedFormats: ['JPG', 'JPEG', 'PNG', 'WebP', 'TIFF', 'GIF']
    });
  }
  
  next(error);
});

module.exports = router;