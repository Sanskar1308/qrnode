const prisma = require('../../prisma/client');

class AudioRepository {
    // Fetch audio data based on audioId and userId
    async getDataTable({ audioId, userId }) {
        try {
            const data = await prisma.audiotbl.findMany({ // Change this to match your model
                where: {
                    Id: audioId,
                    UserId: userId
                }
            });

            return {
                isResponse: true,
                data: data
            };
        } catch (error) {
            console.error('Error fetching audio data:', error);
            return {
                isResponse: false,
                error: 'Error fetching audio data'
            };
        }
    }
    
    // Insert a new audio record
    async insertAudio(audioData) {
        try {
            const newAudio = await prisma.audio.create({
                data: audioData
            });
            return {
                isResponse: true,
                data: newAudio
            };
        } catch (error) {
            console.error('Error inserting audio:', error);
            return {
                isResponse: false,
                error: 'Error inserting audio'
            };
        }
    }

    // Update existing audio record
    async updateAudio(audioId, updatedData) {
        try {
            const updatedAudio = await prisma.audio.update({
                where: { id: audioId },
                data: updatedData
            });
            return {
                isResponse: true,
                data: updatedAudio
            };
        } catch (error) {
            console.error('Error updating audio:', error);
            return {
                isResponse: false,
                error: 'Error updating audio'
            };
        }
    }

    // Delete audio by audioId
    async deleteAudio(audioId) {
        try {
            await prisma.audio.delete({
                where: { id: audioId }
            });
            return {
                isResponse: true,
                message: 'Audio deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting audio:', error);
            return {
                isResponse: false,
                error: 'Error deleting audio'
            };
        }
    }
}

module.exports = new AudioRepository();
