import WorkerPool from './workerPool.js';

const pool = new WorkerPool(4, 'worker.js');

pool.run({ number: 5 }).then((result) => {
    console.log('Result:', result);
});
