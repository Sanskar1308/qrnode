const prisma = require('../../prisma/client');

class CampaignRepository {
    // Fetch campaign data based on campaignId and userId
    async getDataTable({ userId, campaignId }) {
        try {
            const data = await prisma.campaigninfotbl.findFirst({
                where: {
                    Id: campaignId,
                    UserId: userId
                }
            });

            return {
                isResponse: true,
                data: data
            };
        } catch (error) {
            console.error('Error fetching campaign data:', error);
            return {
                isResponse: false,
                error: 'Error fetching campaign data'
            };
        }
    }

    // Insert a new campaign record
    async insertCampaign(campaignData) {
        try {
            const newCampaign = await prisma.campaign.create({
                data: campaignData
            });
            return {
                isResponse: true,
                data: newCampaign
            };
        } catch (error) {
            console.error('Error inserting campaign:', error);
            return {
                isResponse: false,
                error: 'Error inserting campaign'
            };
        }
    }

    // Update existing campaign record
    async updateCampaign(campaignId, updatedData) {
        try {
            const updatedCampaign = await prisma.campaign.update({
                where: { id: campaignId },
                data: updatedData
            });
            return {
                isResponse: true,
                data: updatedCampaign
            };
        } catch (error) {
            console.error('Error updating campaign:', error);
            return {
                isResponse: false,
                error: 'Error updating campaign'
            };
        }
    }

    // Delete campaign by campaignId
    async deleteCampaign(campaignId) {
        try {
            await prisma.campaign.delete({
                where: { id: campaignId }
            });
            return {
                isResponse: true,
                message: 'Campaign deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting campaign:', error);
            return {
                isResponse: false,
                error: 'Error deleting campaign'
            };
        }
    }
}

module.exports = new CampaignRepository();
