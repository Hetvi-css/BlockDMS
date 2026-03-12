const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const IPFS_DIR = path.join(__dirname, '../../uploads/ipfs');

// Ensure IPFS directory exists
if (!fs.existsSync(IPFS_DIR)) {
    fs.mkdirSync(IPFS_DIR, { recursive: true });
}

/**
 * IPFSService - Simulates IPFS decentralized storage
 * Files are stored locally with SHA-256 based CID generation
 */
class IPFSService {

    /**
     * Generate a CID (Content Identifier) from file buffer
     * Simulates IPFS CID generation using SHA-256 multihash
     */
    static generateCID(buffer) {
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');
        return `Qm${hash.substring(0, 44)}`; // Simulate IPFS CID format
    }

    /**
     * Generate SHA-256 file hash for integrity verification
     */
    static generateFileHash(buffer) {
        return crypto.createHash('sha256').update(buffer).digest('hex');
    }

    /**
     * Store file in IPFS-like storage
     * Returns CID and file hash
     */
    static async storeFile(fileBuffer, originalName, mimeType) {
        const cid = this.generateCID(fileBuffer);
        const fileHash = this.generateFileHash(fileBuffer);

        // Store by CID (content-addressed like IPFS)
        const cidDir = path.join(IPFS_DIR, cid);
        if (!fs.existsSync(cidDir)) {
            fs.mkdirSync(cidDir, { recursive: true });
        }

        const filePath = path.join(cidDir, originalName);

        // Store file
        fs.writeFileSync(filePath, fileBuffer);

        // Store metadata
        const metadata = {
            cid,
            fileHash,
            originalName,
            mimeType,
            size: fileBuffer.length,
            storedAt: new Date().toISOString(),
            ipfsPath: `/ipfs/${cid}/${originalName}`
        };
        fs.writeFileSync(path.join(cidDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

        return {
            cid,
            fileHash,
            ipfsPath: `/ipfs/${cid}/${originalName}`,
            localPath: filePath,
            size: fileBuffer.length
        };
    }

    /**
     * Retrieve file from IPFS-like storage by CID
     */
    static async getFile(cid, fileName) {
        const cidDir = path.join(IPFS_DIR, cid);
        if (!fs.existsSync(cidDir)) {
            throw new Error(`IPFS: No content found for CID ${cid}`);
        }

        // Try the specific filename first
        let filePath = path.join(cidDir, fileName);
        if (!fs.existsSync(filePath)) {
            // Find any file in the directory
            const files = fs.readdirSync(cidDir).filter(f => f !== 'metadata.json');
            if (files.length === 0) throw new Error(`IPFS: File not found for CID ${cid}`);
            filePath = path.join(cidDir, files[0]);
        }

        const buffer = fs.readFileSync(filePath);
        const metadataPath = path.join(cidDir, 'metadata.json');
        const metadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath, 'utf8')) : {};

        return { buffer, metadata, filePath };
    }

    /**
     * Verify file integrity - recalculate hash and compare with stored hash
     */
    static async verifyFile(cid, storedHash, fileName) {
        try {
            const { buffer } = await this.getFile(cid, fileName);
            const currentHash = this.generateFileHash(buffer);
            return {
                isValid: currentHash === storedHash,
                currentHash,
                storedHash,
                tamperingDetected: currentHash !== storedHash
            };
        } catch (error) {
            return { isValid: false, error: error.message, tamperingDetected: true };
        }
    }

    /**
     * Get IPFS metadata for a CID
     */
    static async getMetadata(cid) {
        const metadataPath = path.join(IPFS_DIR, cid, 'metadata.json');
        if (!fs.existsSync(metadataPath)) {
            throw new Error(`No metadata found for CID ${cid}`);
        }
        return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    }
}

module.exports = IPFSService;
