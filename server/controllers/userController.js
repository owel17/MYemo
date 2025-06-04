const UserProfile = require('../models/UserProfile');

// Membuat profil pengguna baru
exports.createProfile = async (req, res) => {
    try {
        const userProfile = new UserProfile(req.body);
        await userProfile.save();
        res.status(201).json(userProfile);
    } catch (error) {
        res.status(400).json({
            error: 'Error creating user profile',
            message: error.message
        });
    }
};

// Mendapatkan profil pengguna
exports.getProfile = async (req, res) => {
    try {
        const profile = await UserProfile.findById(req.params.id)
            .populate('emotionHistory');
        if (!profile) {
            return res.status(404).json({
                error: 'Profile not found'
            });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching profile',
            message: error.message
        });
    }
};

// Memperbarui profil pengguna
exports.updateProfile = async (req, res) => {
    try {
        const profile = await UserProfile.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!profile) {
            return res.status(404).json({
                error: 'Profile not found'
            });
        }
        res.json(profile);
    } catch (error) {
        res.status(400).json({
            error: 'Error updating profile',
            message: error.message
        });
    }
};

// Menghapus profil pengguna
exports.deleteProfile = async (req, res) => {
    try {
        const profile = await UserProfile.findByIdAndDelete(req.params.id);
        if (!profile) {
            return res.status(404).json({
                error: 'Profile not found'
            });
        }
        res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
        res.status(500).json({
            error: 'Error deleting profile',
            message: error.message
        });
    }
}; 