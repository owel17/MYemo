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

// Mencocokkan pengguna berdasarkan data emosional mereka
exports.matchUsersBasedOnEmotion = async (req, res) => {
    try {
        // 1. Ambil semua pengguna beserta data emosional mereka
        const allUsers = await UserProfile.find().populate('emotionHistory');

        // 2. Ambil data pengguna target berdasarkan ID
        const targetUser = await UserProfile.findById(req.params.userId).populate('emotionHistory');
        if (!targetUser) {
            return res.status(404).json({ error: 'Pengguna target tidak ditemukan' });
        }

        // 3. Fungsi untuk membandingkan data emosional dua pengguna
        function compareEmotions(emotionsA, emotionsB) {
            // Ambil total skor dari setiap sesi emosi
            const scoresA = emotionsA.map(e => e.totalScore);
            const scoresB = emotionsB.map(e => e.totalScore);
            if (scoresA.length === 0 || scoresB.length === 0) return Infinity;
            // Hitung rata-rata skor total
            const avgA = scoresA.reduce((a, b) => a + b, 0) / scoresA.length;
            const avgB = scoresB.reduce((a, b) => a + b, 0) / scoresB.length;
            // Kembalikan selisih absolut rata-rata skor
            return Math.abs(avgA - avgB);
        }

        // 4. Threshold kecocokan (misal: 3)
        const THRESHOLD = 3;

        // 5. Bandingkan dengan pengguna lain
        const matchedUsers = allUsers.filter(user => {
            if (user.id === targetUser.id) return false; // Jangan bandingkan dengan diri sendiri
            const diff = compareEmotions(targetUser.emotionHistory, user.emotionHistory);
            return diff < THRESHOLD;
        });

        // 6. Kembalikan daftar pengguna yang cocok
        res.json({
            matchedUsers: matchedUsers.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email
            }))
        });
    } catch (error) {
        // 7. Error handling
        res.status(500).json({
            error: 'Terjadi kesalahan saat mencocokkan pengguna',
            message: error.message
        });
    }
}; 