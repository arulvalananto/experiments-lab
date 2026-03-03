class WorkerPool {
    constructor(size, workerFile) {
        this.workers = [];
        this.queue = [];

        for (let i = 0; i < size; i++) {
            const worker = new Worker(workerFile);

            worker.onmessage = (event) => {
                const { resolve } = worker.currentTask;
                resolve(event.data);

                worker.currentTask = null;
                this.next(worker);
            };

            this.workers.push(worker);
        }
    }

    run(taskData) {
        return new Promise((resolve) => {
            const availableWorker = this.workers.find((w) => !w.currentTask);

            const task = { taskData, resolve };

            if (availableWorker) {
                availableWorker.currentTask = task;
                availableWorker.postMessage(taskData);
            } else {
                this.queue.push(task);
            }
        });
    }

    next(worker) {
        if (this.queue.length > 0) {
            const task = this.queue.shift();
            worker.currentTask = task;
            worker.postMessage(task.taskData);
        }
    }
}

export default WorkerPool;