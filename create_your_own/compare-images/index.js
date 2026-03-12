const fs = require('fs');
const crypto = require('crypto');

function getMD5(filePath) {
    const fileBuffer = fs.readFileSync(filePath);

    const hash = crypto.createHash('md5');
    hash.update(fileBuffer);

    return hash.digest('hex');
}

function compareImages(img1, img2) {
    const hash1 = getMD5(img1);
    const hash2 = getMD5(img2);

    console.log('Image1 MD5:', hash1);
    console.log('Image2 MD5:', hash2);

    if (hash1 === hash2) {
        console.log('✅ Images are EXACTLY the same');
    } else {
        console.log('❌ Images are different');
    }
}

compareImages('image1.jpg', 'image2.jpg');


// How it works:
// 1. The `getMD5` function reads the image file and computes its MD5 hash.
// 2. The `compareImages` function compares the MD5 hashes of two images.
// 3. If the hashes are identical, it indicates that the images are exactly the same; 
// otherwise, they are different.
// Note: This method only checks if the files are identical at the binary level. 
// It does not account for visual similarities or differences (e.g., different formats, 
// compression levels, or metadata).