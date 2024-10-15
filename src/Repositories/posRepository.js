const prisma = require('../../prisma/client');

class POSRepository {
    // Fetch POS data based on POS ID, userId, and merchantName
    async getDataTable({ userId, posId, merchantName }) {
        try {
            const data = await prisma.postbl.findMany({
                where: {
                    ApiKey: posId,
                    UserId: userId,
                    MerchantId: merchantName
                }
            });

            return {
                isResponse: true,
                data: data
            };
        } catch (error) {
            console.error('Error fetching POS data:', error);
            return {
                isResponse: false,
                error: 'Error fetching POS data'
            };
        }
    }

    // Insert a new POS record
    async insertPOS(posData) {
        try {
            const newPOS = await prisma.pos.create({
                data: posData
            });
            return {
                isResponse: true,
                data: newPOS
            };
        } catch (error) {
            console.error('Error inserting POS:', error);
            return {
                isResponse: false,
                error: 'Error inserting POS'
            };
        }
    }

    // Update existing POS record
    async updatePOS(posId, updatedData) {
        try {
            const updatedPOS = await prisma.pos.update({
                where: { id: posId },
                data: updatedData
            });
            return {
                isResponse: true,
                data: updatedPOS
            };
        } catch (error) {
            console.error('Error updating POS:', error);
            return {
                isResponse: false,
                error: 'Error updating POS'
            };
        }
    }

    // Delete POS by posId
    async deletePOS(posId) {
        try {
            await prisma.pos.delete({
                where: { id: posId }
            });
            return {
                isResponse: true,
                message: 'POS deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting POS:', error);
            return {
                isResponse: false,
                error: 'Error deleting POS'
            };
        }
    }
}

module.exports = new POSRepository();
