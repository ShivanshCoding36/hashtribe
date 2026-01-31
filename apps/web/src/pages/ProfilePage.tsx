import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

interface UserProfile {
    id: string;
    username: string;
    display_name: string;
    full_name: string;
    bio: string;
    avatar_url: string;
    devcom_score: number;
    followers_count: number;
}

export const ProfilePage = () => {
    const { username } = useParams<{ username: string }>();
    const { user: authUser } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        bio: ''
    });

    useEffect(() => {
        if (username) {
            getProfile();
        }
    }, [username]);


    async function getProfile() {
        if (!username) return;
        try {
            setLoading(true);
            const { data, error } = await (supabase.from('users') as any)
                .select('*')
                .eq('username', username)
                .single();

            if (data) {
                const userData = (data as unknown) as UserProfile;
                setProfile(userData);
                setFormData({
                    full_name: userData.full_name || userData.display_name || '',
                    bio: userData.bio || ''
                });
            }
            if (error) throw error;
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id || authUser?.id;

        if (!currentUserId) {
            console.error("No valid session found for update.");
            return;
        }

        try {
            const { error } = await (supabase.from('users') as any)
                .update({
                    full_name: formData.full_name,
                    bio: formData.bio,
                    display_name: formData.full_name
                })
                .eq('id', currentUserId); 

            if (error) throw error;

            setIsEditing(false);
            getProfile(); 
        } catch (err) {
            console.error('Update failed:', err);
        }
    }

    async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
        try {
            setLoading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${authUser?.id}/${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await (supabase.from('users') as any)
                .update({ avatar_url: publicUrl })
                .eq('id', authUser?.id);

            if (updateError) throw updateError;

            getProfile();
            alert('Avatar updated!');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-dark-400 font-mono">Decrypting Member Data...</div>;
    if (!profile) return <div className="p-8 text-center bg-black min-h-screen text-white">404: Signal Lost</div>;

    const isOwner = authUser?.id === profile.id;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="card border border-zinc-800 bg-zinc-900/40 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
                <div className="flex flex-col md:flex-row gap-10 items-start">
                    <div className="relative mx-auto md:mx-0 group">
                        <img
                            src={profile.avatar_url}
                            className={`w-36 h-36 rounded-full border-4 border-primary-600/30 object-cover ${isEditing ? 'cursor-pointer opacity-50' : ''}`}
                            onClick={() => isEditing && document.getElementById('avatar-upload')?.click()}
                        />
                        {isEditing && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-white text-xs font-mono bg-black/50 px-2 py-1 rounded">Change</span>
                            </div>
                        )}
                        <input
                            type="file"
                            id="avatar-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={uploadAvatar}
                        />
                    </div>

                    <div className="flex-1 w-full text-center md:text-left">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
                            <div className="w-full">
                                {isEditing ? (
                                    <input
                                        className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-3xl font-bold rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                ) : (
                                    <h1 className="text-4xl font-black text-zinc-100 tracking-tight leading-none mb-1">{profile.full_name || profile.display_name}</h1>
                                )}
                                <p className="text-primary-500 font-mono text-sm tracking-widest mt-2 uppercase">@{profile.username}</p>
                            </div>

                            {isOwner && (
                                <button
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    className={`w-full md:w-auto px-8 py-2.5 rounded-lg font-bold transition-all transform active:scale-95 border ${isEditing
                                        ? 'bg-green-600 hover:bg-green-700 text-white border-transparent'
                                        : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border-zinc-700'
                                        }`}
                                >
                                    {isEditing ? 'Confirm Changes' : 'Modify Profile'}
                                </button>
                            )}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] mb-4">Transmission / Bio</h3>
                            {isEditing ? (
                                <textarea
                                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl p-5 h-40 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            ) : (
                                <p className="text-zinc-400 leading-relaxed text-lg border-l-2 border-primary-600/20 pl-6 py-2 italic font-light">
                                    "{profile.bio || "No transmission received from this member."}"
                                </p>
                            )}
                        </div>

                        <div className="mt-12 pt-8 border-t border-zinc-800/50 flex justify-center md:justify-start gap-16 text-zinc-100">
                            <div>
                                <p className="text-4xl font-black">{profile.devcom_score || 0}</p>
                                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] mt-2">DevCom Points</p>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-4xl font-black">{profile.followers_count || 0}</p>
                                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] mt-2">Followers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};