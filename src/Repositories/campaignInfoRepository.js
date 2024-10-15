const prisma = require('../../prisma/client');

class CampaignInfoRepository {
    // Fetch all campaign info by campaignId and userId
    async getDataTable({ campaignId, userId }) {
        try {
            const data = await prisma.campaigninfotbl.findMany({
                where: {
                    CampaignId: campaignId,
                    UserId: userId
                }
            });
            return {
                isResponse: true,
                data: data
            };
        } catch (error) {
            console.error('Error fetching campaign info:', error);
            return {
                isResponse: false,
                error: 'Error fetching campaign info'
            };
        }
    }

    // Insert a new campaign info record
    async insertCampaignInfo(campaignInfoData) {
        try {
            const newRecord = await prisma.campaignInfo.create({
                data: campaignInfoData
            });
            return {
                isResponse: true,
                data: newRecord
            };
        } catch (error) {
            console.error('Error inserting campaign info:', error);
            return {
                isResponse: false,
                error: 'Error inserting campaign info'
            };
        }
    }

    // Update existing campaign info record
    async updateCampaignInfo(campaignInfoId, updatedData) {
        try {
            const updatedRecord = await prisma.campaignInfo.update({
                where: { id: campaignInfoId },
                data: updatedData
            });
            return {
                isResponse: true,
                data: updatedRecord
            };
        } catch (error) {
            console.error('Error updating campaign info:', error);
            return {
                isResponse: false,
                error: 'Error updating campaign info'
            };
        }
    }

    // Delete campaign info by campaignInfoId
    async deleteCampaignInfo(campaignInfoId) {
        try {
            await prisma.campaignInfo.delete({
                where: { id: campaignInfoId }
            });
            return {
                isResponse: true,
                message: 'Campaign info deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting campaign info:', error);
            return {
                isResponse: false,
                error: 'Error deleting campaign info'
            };
        }
    }
}

module.exports = new CampaignInfoRepository();
