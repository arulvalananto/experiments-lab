const retry = (callback, retries = 5, delay = 500) => {
    return new Promise((resolve, reject) => {
        const attempt = (currentTry) => {
            callback()
                .then(resolve)
                .catch((error) => {
                    if (currentTry >= retries) {
                        return reject(error);
                    }

                    setTimeout(
                        () => {
                            attempt(currentTry + 1);
                        },
                        500 * Math.pow(2, currentTry),
                    );
                });
        };

        attempt(0);
    });
};

let count = 0;

retry(() => {
    count++;
    console.log('Attempt:', count);

    if (count < 3) {
        return Promise.reject('Still failing');
    }

    return Promise.resolve('Success 🎉');
})
    .then((result) => console.log(result))
    .catch(console.error);
