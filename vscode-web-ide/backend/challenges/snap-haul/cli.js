const process = require('process');

class SnapshotDownloader {
    constructor() {
        this.downloadedBytes = 0;
        this.totalBytes = 1000;
        this.retries = 0;
    }

    downloadChunk() {
        // Simulate a connection instability on the second and third chunks
        if (this.downloadedBytes > 0 && this.retries < 2) {
            // BUG: Warning is printed to stdout instead of stderr
            // BUG: Warning is printed multiple times
            console.log("Warning: Connection may be unstable");
            this.retries++;
            return false;
        }

        this.downloadedBytes += 250;
        return true;
    }

    start() {
        console.log("Starting snapshot download...");
        
        while (this.downloadedBytes < this.totalBytes) {
            let success = this.downloadChunk();
            if (success) {
                console.log(`Downloaded ${this.downloadedBytes}/${this.totalBytes} bytes`);
            }
        }
        
        console.log("Download complete.");
    }
}

const downloader = new SnapshotDownloader();
downloader.start();
