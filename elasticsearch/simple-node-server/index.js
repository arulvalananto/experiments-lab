import Fastify from 'fastify';
import { Client } from '@elastic/elasticsearch';

const fastify = Fastify({ logger: true });

/**
 * Elasticsearch Client
 */
const es = new Client({
    node: 'http://localhost:9200',
    auth: {
        username: 'elastic',
        password: 'mySecretPassword',
    },
});

/**
 * Create index with proper mapping (if not exists)
 */
async function createIndex() {
    try {
        const exists = await es.indices.exists({ index: 'products' });

        if (!exists) {
            await es.indices.create({
                index: 'products',
                mappings: {
                    properties: {
                        name: { type: 'text' },
                        description: { type: 'text' },
                        category: { type: 'keyword' },
                        price: { type: 'float' },
                        rating: { type: 'float' },
                    },
                },
            });

            console.log('Products index created');
        }
    } catch (err) {
        console.error('Index creation error:', err);
    }
}

/**
 * Add Product
 */
fastify.post('/products', async (req, reply) => {
    const product = req.body;

    if (!product?.id) {
        return reply.code(400).send({ error: 'Product id is required' });
    }

    await es.index({
        index: 'products',
        id: product.id,
        document: product,
    });

    return { success: true };
});

/**
 * Search Products
 */
fastify.get('/search', async (req, reply) => {
    const {
        q,
        category,
        minPrice,
        maxPrice,
        sort = 'rating',
        order = 'desc',
        page = 1,
        size = 10,
    } = req.query;

    const pageNum = Number(page);
    const sizeNum = Number(size);

    const must = [];
    const filter = [];

    if (q) {
        must.push({
            multi_match: {
                query: q,
                fields: ['name', 'description'],
            },
        });
    }

    if (category) {
        filter.push({
            term: { category },
        });
    }

    if (minPrice || maxPrice) {
        filter.push({
            range: {
                price: {
                    gte: minPrice ? Number(minPrice) : undefined,
                    lte: maxPrice ? Number(maxPrice) : undefined,
                },
            },
        });
    }

    const result = await es.search({
        index: 'products',
        from: (pageNum - 1) * sizeNum,
        size: sizeNum,
        query: {
            bool: {
                must,
                filter,
            },
        },
        sort: [
            {
                [sort]: {
                    order,
                },
            },
        ],
    });

    return {
        total:
            typeof result.hits.total === 'number'
                ? result.hits.total
                : result.hits.total.value,
        results: result.hits.hits.map((hit) => hit._source),
    };
});

/**
 * Start Server
 */
const start = async () => {
    try {
        await createIndex();
        await fastify.listen({ port: 3000 });
        console.log('Server running on http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
