const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Block = require('../models/Block');

/**
 * BlockchainService - Simulates Hyperledger Fabric smart contracts using SHA-256 linked blocks
 * Each block contains transactions with document hashes and audit data
 */
class BlockchainService {

    /**
     * Compute SHA-256 hash of given data
     */
    static computeHash(data) {
        return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    }

    /**
     * Compute Merkle Root from transaction hashes
     */
    static computeMerkleRoot(transactions) {
        if (!transactions || transactions.length === 0) return '0'.repeat(64);
        let hashes = transactions.map(tx => crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex'));
        while (hashes.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < hashes.length; i += 2) {
                const combined = hashes[i] + (hashes[i + 1] || hashes[i]);
                nextLevel.push(crypto.createHash('sha256').update(combined).digest('hex'));
            }
            hashes = nextLevel;
        }
        return hashes[0];
    }

    /**
     * Get genesis block or create it
     */
    static async getGenesisBlock() {
        let genesis = await Block.findOne({ blockIndex: 0 });
        if (!genesis) {
            const genesisData = {
                blockIndex: 0,
                previousHash: '0'.repeat(64),
                timestamp: new Date('2024-01-01T00:00:00Z'),
                transactions: [],
                nonce: 0
            };
            const hash = this.computeHash(genesisData);
            genesis = await Block.create({ ...genesisData, hash, merkleRoot: '0'.repeat(64) });
        }
        return genesis;
    }

    /**
     * Get the latest block in the chain
     */
    static async getLatestBlock() {
        await this.getGenesisBlock(); // Ensure genesis exists
        return Block.findOne().sort({ blockIndex: -1 });
    }

    /**
     * Create a new block with the given transactions
     */
    static async createBlock(transactions, validator = 'SYSTEM') {
        const latestBlock = await this.getLatestBlock();
        const blockIndex = latestBlock.blockIndex + 1;
        const previousHash = latestBlock.hash;
        const timestamp = new Date();
        const merkleRoot = this.computeMerkleRoot(transactions);

        // Simple proof of work (difficulty 2 - fast for demo)
        let nonce = 0;
        let hash = '';
        do {
            nonce++;
            hash = this.computeHash({ blockIndex, previousHash, timestamp, transactions, nonce, merkleRoot });
        } while (!hash.startsWith('00'));

        const block = await Block.create({
            blockIndex,
            previousHash,
            hash,
            timestamp,
            transactions,
            nonce,
            merkleRoot,
            validator
        });

        return block;
    }

    /**
     * SMART CONTRACT: registerUser()
     */
    static async registerUser(userId, userName, role, email) {
        const txId = uuidv4();
        const transaction = {
            txId,
            type: 'REGISTER_USER',
            userId: userId.toString(),
            data: { userName, role, email, action: 'registerUser' },
            timestamp: new Date()
        };
        const block = await this.createBlock([transaction], userId.toString());
        return { txId, blockIndex: block.blockIndex, blockHash: block.hash };
    }

    /**
     * SMART CONTRACT: uploadDocument()
     */
    static async uploadDocument(documentId, documentHash, cid, userId, title, departmentId) {
        const txId = uuidv4();
        const transaction = {
            txId,
            type: 'UPLOAD_DOCUMENT',
            documentId: documentId.toString(),
            documentHash,
            userId: userId.toString(),
            data: { cid, title, departmentId: departmentId.toString(), action: 'uploadDocument', hash: documentHash },
            timestamp: new Date()
        };
        const block = await this.createBlock([transaction], userId.toString());
        return { txId, blockIndex: block.blockIndex, blockHash: block.hash };
    }

    /**
     * SMART CONTRACT: approveDocument()
     */
    static async approveDocument(documentId, documentHash, approverId, previousStatus) {
        const txId = uuidv4();
        const transaction = {
            txId,
            type: 'APPROVE_DOCUMENT',
            documentId: documentId.toString(),
            documentHash,
            userId: approverId.toString(),
            data: { action: 'approveDocument', previousStatus, newStatus: 'approved', approvedAt: new Date() },
            timestamp: new Date()
        };
        const block = await this.createBlock([transaction], approverId.toString());
        return { txId, blockIndex: block.blockIndex, blockHash: block.hash };
    }

    /**
     * SMART CONTRACT: rejectDocument()
     */
    static async rejectDocument(documentId, documentHash, reviewerId, reason) {
        const txId = uuidv4();
        const transaction = {
            txId,
            type: 'REJECT_DOCUMENT',
            documentId: documentId.toString(),
            documentHash,
            userId: reviewerId.toString(),
            data: { action: 'rejectDocument', reason, newStatus: 'rejected', rejectedAt: new Date() },
            timestamp: new Date()
        };
        const block = await this.createBlock([transaction], reviewerId.toString());
        return { txId, blockIndex: block.blockIndex, blockHash: block.hash };
    }

    /**
     * SMART CONTRACT: escalateDocument()
     */
    static async escalateDocument(documentId, documentHash, hodId, adminId, reason) {
        const txId = uuidv4();
        const transaction = {
            txId,
            type: 'ESCALATE_DOCUMENT',
            documentId: documentId.toString(),
            documentHash,
            userId: hodId.toString(),
            data: { action: 'escalateDocument', escalatedTo: adminId.toString(), reason, newStatus: 'escalated', escalatedAt: new Date() },
            timestamp: new Date()
        };
        const block = await this.createBlock([transaction], hodId.toString());
        return { txId, blockIndex: block.blockIndex, blockHash: block.hash };
    }

    /**
     * SMART CONTRACT: verifyDocument()
     * Recalculates and compares hash - detects tampering
     */
    static async verifyDocument(documentId, currentHash, storedHash) {
        const isValid = currentHash === storedHash;
        const txId = uuidv4();
        const transaction = {
            txId,
            type: 'VERIFY_DOCUMENT',
            documentId: documentId.toString(),
            documentHash: storedHash,
            userId: 'SYSTEM',
            data: {
                action: 'verifyDocument',
                providedHash: currentHash,
                storedHash,
                result: isValid ? 'VALID' : 'TAMPERED',
                verifiedAt: new Date()
            },
            timestamp: new Date()
        };
        await this.createBlock([transaction], 'SYSTEM');
        return { isValid, txId, result: isValid ? 'VALID' : 'TAMPERED_DETECTED' };
    }

    /**
     * Verify full blockchain integrity (all blocks)
     */
    static async verifyChainIntegrity() {
        const blocks = await Block.find().sort({ blockIndex: 1 });
        const issues = [];

        for (let i = 1; i < blocks.length; i++) {
            const current = blocks[i];
            const previous = blocks[i - 1];

            // Check previous hash linkage
            if (current.previousHash !== previous.hash) {
                issues.push({ blockIndex: current.blockIndex, issue: 'Previous hash mismatch - chain broken' });
            }

            // Recompute hash and verify
            const recomputed = this.computeHash({
                blockIndex: current.blockIndex,
                previousHash: current.previousHash,
                timestamp: current.timestamp,
                transactions: current.transactions,
                nonce: current.nonce,
                merkleRoot: current.merkleRoot
            });

            if (recomputed !== current.hash) {
                issues.push({ blockIndex: current.blockIndex, issue: 'Block hash invalid - data tampered' });
            }
        }

        return {
            isValid: issues.length === 0,
            totalBlocks: blocks.length,
            issues,
            checkedAt: new Date()
        };
    }

    /**
     * Get all blocks for ledger view
     */
    static async getFullChain(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const total = await Block.countDocuments();
        const blocks = await Block.find().sort({ blockIndex: -1 }).skip(skip).limit(limit);
        return { blocks, total, page, totalPages: Math.ceil(total / limit) };
    }

    /**
     * Get blockchain stats
     */
    static async getStats() {
        const totalBlocks = await Block.countDocuments();
        const latestBlock = await this.getLatestBlock();
        const uploadTxs = await Block.aggregate([
            { $unwind: '$transactions' },
            { $group: { _id: '$transactions.type', count: { $sum: 1 } } }
        ]);
        return { totalBlocks, latestBlockIndex: latestBlock?.blockIndex ?? 0, latestBlockHash: latestBlock?.hash ?? null, transactionsByType: uploadTxs };
    }
}

module.exports = BlockchainService;
