const router = require('express').Router();
const crypto = require('crypto');
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { prisma } = require('../prismaInstance');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3BucketName = process.env.S3_BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION 
const s3AccessKey = process.env.S3_ACCESS_KEY
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY

const { verifyAdmin } = require('../middleware/token'); 

// Initializing S3 Bucket
const s3 = new S3Client({
    credentials: {
        accessKeyId: s3AccessKey,
        secretAccessKey: s3SecretAccessKey,
    },
    region: bucketRegion
});

// Intialize Multer Storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Random image name
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

// @route API_URL/product/
// @method POST
// @desc Create single product
// @perms Admin Only
router.post('/', verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category } = req.body;

        const foundProduct = await prisma.product.findFirst({
            where: {
                name: name,
            },
        })

        if (foundProduct) return res.status(409).json({ error: "Product name already being used. Please try another name." })

        const imageName = randomImageName();
        // Resize image 
        // const buffer = await sharp(req.file.buffer).resize({ height: 1920, width: 1080, fit: "contain"}).toBuffer();

        const params = {
            Bucket: s3BucketName,
            Key: imageName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        }

        const command = new PutObjectCommand(params);

        await s3.send(command);

        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                description,
                category,
                image: imageName,
            },
        });

        return res.status(201).json({ message: "Product created successfully. Please refresh page." })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Unable to create product. Please try again later." })
    }
})

// @route API_URL/product/
// @method GET
// @desc Get product images
// @perms All users
router.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            select: {
                image: true,
                category: true,
                price: true,
                name: true,
                id: true,
            },
        });

        for (const product of products) {
            const getObjectParams = {
                Bucket: s3BucketName,
                Key: product.image,  
            }

            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            product.imageUrl = url;
        }
    
        return res.status(200).json({ message: "Products retrieved", products })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error occurred. Please try again later" })
    }
})

// @route API_URL/product/:id
// @method GET
// @desc Get product
// @perms All users
router.get('/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: {
                id: req.params.id,
            },
            select: {
                image: true,
                category: true,
                price: true,
                name: true,
                id: true,
                description: true,
            },
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found." })
        }

        const getObjectParams = {
            Bucket: s3BucketName,
            Key: product.image,  
        }

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        product.imageUrl = url;

        return res.status(200).json({ message: "Product retrieved", product })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error occurred. Please try again later" })
    }
})

// @route API_URL/product/:id
// @method DELETE
// @desc Delete product
// @perms Admin only
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const id = req.params.id

        const product = await prisma.product.findUnique({
            where: {
                id,
            }
        })

        if (!product) return res.status(404).json({ error: "Product does not exist." })

        const params = {
            Bucket: s3BucketName,
            Key: product.image,
        }

        const command = new DeleteObjectCommand(params);
        await s3.send(command);
        await prisma.product.delete({ where: { id }});

        return res.status(201).json({ message: "Product deleted successfully." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error occurred when deleting product. Please try again later." })
    }
})

module.exports = router;