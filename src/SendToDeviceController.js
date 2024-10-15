class SendToDeviceController {
    constructor(campaignInfoRepository, campaignRepository, posRepository, audioRepository, webSocketBehavior) {
        this._campaignInfoRepository = campaignInfoRepository;
        this._campaignRepository = campaignRepository;
        this._posRepository = posRepository;
        this._audioRepository = audioRepository;
        this._webSocketBehavior = webSocketBehavior; // WebSocket instance for sending data to connected clients
    }

    // Campaign Route: Send campaign-related images to POS devices
    async campaign(req, res) {
        try {
            const model = req.body;
            const userId = req.userId; // Assume userId is set by jwtAuthorizationFilterFactory
   console.log(`${JSON.stringify(model)} ${userId}` );
            // Validate input
            if (model.CampaignId <= 0) {
                return res.status(400).json({ error: 'Invalid CampaignId' });
            }
            if (userId <= 0) {
                return res.status(400).json({ error: 'Invalid UserId' });
            }

            // Fetch campaign data
            const camResult = await this._campaignRepository.getDataTable({ userId, campaignId: model.CampaignId });
            if (!camResult.isResponse) {
                return res.status(400).json({ error: 'Campaign not found' });
            }

            // Fetch campaign info (such as images to send)
            const caminfoResult = await this._campaignInfoRepository.getDataTable({ campaignId: model.CampaignId, userId });
            if (!caminfoResult.isResponse) {
                return res.status(400).json({ error: 'Campaign info not found' });
            }

            const sendImageModels = caminfoResult.data.map(row => ({
                path: row.FilePath,
                position: row.Position
            }));

            // Check if there are images to send
            if (sendImageModels.length === 0) {
                return res.status(400).json({ error: 'No images to send' });
            }

            // Fetch POS devices to send images to
            const posResult = await this._posRepository.getDataTable({ userId, posId: model.PosId, merchantName: model.MerchantName });
            if (!posResult.isResponse) {
                return res.status(400).json({ error: 'POS not found' });
            }

            // Send data to WebSocket clients (POS devices)
            this._webSocketBehavior.sendToClients(posResult, sendImageModels);

            // Respond with success
            res.json({ isResponse: true, sendImageModels });
        } catch (error) {
            // Log error and respond with internal server error
            // AppLogger.error('ECC_618', 'Error in campaign method', 'fullPath', 'SendToDeviceController', 'campaign', error);
            res.status(500).json({ error: 'Internal Server Error' });
            console.log(error);
        }
    }

    // Separate Route: Send separate files (like uploaded images) to POS devices
    async separate(req, res) {
        try {
            const { file, body: { merchantName, posId, position } } = req;
            const userId = req.userId; // Assume userId is set by jwtAuthorizationFilterFactory

            // Validate input
            if (userId <= 0) {
                return res.status(400).json({ error: 'Invalid UserId' });
            }
            if (!merchantName) {
                return res.status(400).json({ error: 'MerchantName is required' });
            }
            if (!posId) {
                return res.status(400).json({ error: 'PosId is required' });
            }
            if (!file) {
                return res.status(400).json({ error: 'File is required' });
            }

            // Create file path for uploaded image
            const filePath = path.join('uploads', file.filename);
            const sendImageModels = [{ path: filePath, position: parseInt(position, 10) }];

            // Fetch POS devices to send images to
            const posResult = await this._posRepository.getDataTable({ userId, posId, merchantName });
            if (!posResult.isResponse) {
                return res.status(400).json({ error: 'POS not found' });
            }

            // Send data to WebSocket clients (POS devices)
            this._webSocketBehavior.sendToClients(posResult, sendImageModels);

            // Respond with success
            res.json({ isResponse: true, sendImageModels });
        } catch (error) {
            // Log error and respond with internal server error
            AppLogger.error('ECC_618', 'Error in separate method', 'fullPath', 'SendToDeviceController', 'separate', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Audio Route: Send audio files to POS devices
    async audio(req, res) {
        try {
            const model = req.body;
            const userId = req.userId; // Assume userId is set by jwtAuthorizationFilterFactory

            // Validate input
            if (model.AudioId <= 0) {
                return res.status(400).json({ error: 'Invalid AudioId' });
            }
            if (userId <= 0) {
                return res.status(400).json({ error: 'Invalid UserId' });
            }

            // Fetch audio data
            const audioResult = await this._audioRepository.getDataTable({ audioId: model.AudioId, userId });
            if (!audioResult.isResponse) {
                return res.status(400).json({ error: 'Audio not found' });
            }

            // Fetch POS devices to send audio to
            const posResult = await this._posRepository.getDataTable({ userId, posId: model.PosId, merchantName: model.MerchantName });
            if (!posResult.isResponse) {
                return res.status(400).json({ error: 'POS not found' });
            }

            // Send data to WebSocket clients (POS devices)
            const sendAudioModels = audioResult.data.map(row => ({
                path: row.filePath,
                position: row.position
            }));
            this._webSocketBehavior.sendToClients(posResult, sendAudioModels);

            // Respond with success
            res.json({ isResponse: true, sendAudioModels });
        } catch (error) {
            // Log error and respond with internal server error
            AppLogger.error('ECC_618', 'Error in audio method', 'fullPath', 'SendToDeviceController', 'audio', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = SendToDeviceController;
