import React, { useRef, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Slider } from './ui/slider';
import axios from 'axios';
import { Loader2, Camera, Trash2, ZoomIn, RotateCw, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { setAuthUser } from '@/redux/authSlice';
import { getUserInitials } from '@/lib/utils';
import Cropper from 'react-easy-crop';

const EditProfile = () => {
    const imageRef = useRef();
    const { user } = useSelector(store => store.auth);
    const [loading, setLoading] = useState(false);
    const [removeLoading, setRemoveLoading] = useState(false);
    const [input, setInput] = useState({
        profilePhoto: user?.profilePicture,
        bio: user?.bio,
        gender: user?.gender
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Cropper states
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Create URL for cropper preview
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
                setCropDialogOpen(true);
                // Reset cropper states
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setRotation(0);
            };
            reader.readAsDataURL(file);
        }
    };

    // Create cropped image from canvas
    const createCroppedImage = async () => {
        try {
            const image = new Image();
            image.src = imageSrc;
            
            await new Promise((resolve) => {
                image.onload = resolve;
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calculate the size of the cropped area
            const { width, height, x, y } = croppedAreaPixels;
            
            canvas.width = width;
            canvas.height = height;

            // Handle rotation
            ctx.save();
            
            if (rotation !== 0) {
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                
                const radians = (rotation * Math.PI) / 180;
                const sin = Math.abs(Math.sin(radians));
                const cos = Math.abs(Math.cos(radians));
                
                tempCanvas.width = image.width * cos + image.height * sin;
                tempCanvas.height = image.width * sin + image.height * cos;
                
                tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
                tempCtx.rotate(radians);
                tempCtx.drawImage(image, -image.width / 2, -image.height / 2);
                
                ctx.drawImage(tempCanvas, x, y, width, height, 0, 0, width, height);
            } else {
                ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
            }

            ctx.restore();

            // Convert canvas to blob
            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
                    resolve(file);
                }, 'image/jpeg', 0.9);
            });
        } catch (error) {
            console.error('Error creating cropped image:', error);
            return null;
        }
    };

    const handleCropConfirm = async () => {
        const croppedFile = await createCroppedImage();
        if (croppedFile) {
            setInput({ ...input, profilePhoto: croppedFile });
            setCropDialogOpen(false);
            toast.success('Image cropped successfully!');
        } else {
            toast.error('Failed to crop image');
        }
    };

    const handleCropCancel = () => {
        setCropDialogOpen(false);
        setImageSrc(null);
    };

    const selectChangeHandler = (value) => {
        setInput({ ...input, gender: value });
    };

    const removeProfilePicture = async () => {
        try {
            setRemoveLoading(true);
            const res = await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/v1/user/profile/remove-picture`,
                { withCredentials: true }
            );
            
            if (res.data.success) {
                const updatedUserData = {
                    ...user,
                    profilePicture: ''
                };
                dispatch(setAuthUser(updatedUserData));
                setInput({ ...input, profilePhoto: '' });
                toast.success('Profile picture removed');
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || 'Failed to remove profile picture');
        } finally {
            setRemoveLoading(false);
        }
    };

    const editProfileHandler = async () => {
        console.log(input);
        const formData = new FormData();
        formData.append("bio", input.bio);
        formData.append("gender", input.gender);
        if(input.profilePhoto && input.profilePhoto instanceof File){
            formData.append("profilePhoto", input.profilePhoto);
        }
        try {
            setLoading(true);
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/user/profile/edit`, formData,{
                headers:{
                    'Content-Type':'multipart/form-data'
                },
                withCredentials:true
            });
            if(res.data.success){
                const updatedUserData = {
                    ...user,
                    bio:res.data.user?.bio,
                    profilePicture:res.data.user?.profilePicture,
                    gender:res.data.user.gender
                };
                dispatch(setAuthUser(updatedUserData));
                navigate(`/profile/${user?._id}`);
                toast.success(res.data.message);
            }

        } catch (error) {
            console.log(error);
            toast.error(error.response.data.messasge);
        } finally{
            setLoading(false);
        }
    };

    // Get the preview URL for the avatar
    const getPreviewUrl = () => {
        if (input.profilePhoto instanceof File) {
            return URL.createObjectURL(input.profilePhoto);
        }
        return input.profilePhoto || user?.profilePicture;
    };

    return (
        <div className='flex max-w-2xl mx-auto pl-10 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200'>
            <section className='flex flex-col gap-6 w-full my-8'>
                <h1 className='font-bold text-xl text-gray-900 dark:text-white'>Edit Profile</h1>
                
                {/* Profile Picture Section */}
                <div className='flex flex-col items-center gap-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700'>
                    <div className='relative group'>
                        <Avatar className='h-28 w-28 border-4 border-white dark:border-gray-700 shadow-lg'>
                            <AvatarImage src={getPreviewUrl()} alt="profile_image" className='object-cover' />
                            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-semibold text-3xl">
                                {getUserInitials(user?.username)}
                            </AvatarFallback>
                        </Avatar>
                        
                        {/* Camera overlay on hover */}
                        <div 
                            onClick={() => imageRef?.current.click()}
                            className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
                        >
                            <Camera className='w-8 h-8 text-white' />
                        </div>
                    </div>
                    
                    <div className='text-center'>
                        <h2 className='font-bold text-lg text-gray-900 dark:text-white'>{user?.username}</h2>
                        <p className='text-gray-500 dark:text-gray-400 text-sm'>{user?.email}</p>
                    </div>
                    
                    <div className='flex gap-3'>
                        <input ref={imageRef} onChange={fileChangeHandler} type='file' accept='image/*' className='hidden' />
                        <Button 
                            onClick={() => imageRef?.current.click()} 
                            className='bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
                        >
                            <Camera className='w-4 h-4 mr-2' />
                            Change Photo
                        </Button>
                        {(user?.profilePicture || input.profilePhoto) && (
                            <Button 
                                variant='outline'
                                onClick={removeProfilePicture}
                                disabled={removeLoading}
                                className='border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20'
                            >
                                {removeLoading ? (
                                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                ) : (
                                    <Trash2 className='w-4 h-4 mr-2' />
                                )}
                                Remove
                            </Button>
                        )}
                    </div>
                    
                    {input.profilePhoto instanceof File && (
                        <p className='text-sm text-emerald-600 dark:text-emerald-400'>
                            ✓ New photo ready to upload
                        </p>
                    )}
                </div>

                {/* Bio Section */}
                <div>
                    <h1 className='font-bold text-xl mb-2 text-gray-900 dark:text-white'>Bio</h1>
                    <Textarea 
                        value={input.bio} 
                        onChange={(e) => setInput({ ...input, bio: e.target.value })} 
                        name='bio' 
                        placeholder='Tell us about yourself and your travel adventures...'
                        className="focus-visible:ring-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 min-h-[100px]" 
                    />
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                        {input.bio?.length || 0}/150 characters
                    </p>
                </div>

                {/* Gender Section */}
                <div>
                    <h1 className='font-bold mb-2 text-gray-900 dark:text-white'>Gender</h1>
                    <Select defaultValue={input.gender} onValueChange={selectChangeHandler}>
                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-emerald-500">
                            <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                            <SelectGroup>
                                <SelectItem value="male" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Male</SelectItem>
                                <SelectItem value="female" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Female</SelectItem>
                                <SelectItem value="other" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Other</SelectItem>
                                <SelectItem value="prefer-not-to-say" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Prefer not to say</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                {/* Submit Button */}
                <div className='flex justify-end gap-3'>
                    <Button 
                        variant='outline'
                        onClick={() => navigate(`/profile/${user?._id}`)}
                        className='border-gray-300 dark:border-gray-600'
                    >
                        Cancel
                    </Button>
                    {loading ? (
                        <Button className='bg-gradient-to-r from-emerald-500 to-teal-500'>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Saving...
                        </Button>
                    ) : (
                        <Button 
                            onClick={editProfileHandler} 
                            className='bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                        >
                            Save Changes
                        </Button>
                    )}
                </div>
            </section>

            {/* Image Cropper Dialog */}
            <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
                <DialogContent className='max-w-lg bg-white dark:bg-gray-900 p-0 overflow-hidden'>
                    <DialogHeader className='p-4 border-b border-gray-200 dark:border-gray-700'>
                        <DialogTitle className='text-gray-900 dark:text-white'>Crop Profile Picture</DialogTitle>
                    </DialogHeader>
                    
                    <div className='relative h-[350px] bg-gray-900'>
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={1}
                                cropShape='round'
                                showGrid={false}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        )}
                    </div>

                    {/* Cropper Controls */}
                    <div className='p-4 space-y-4 bg-gray-50 dark:bg-gray-800'>
                        {/* Zoom Control */}
                        <div className='flex items-center gap-4'>
                            <ZoomIn className='w-5 h-5 text-gray-500 dark:text-gray-400' />
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(value) => setZoom(value[0])}
                                className='flex-1'
                            />
                            <span className='text-sm text-gray-500 dark:text-gray-400 w-12'>{zoom.toFixed(1)}x</span>
                        </div>

                        {/* Rotation Control */}
                        <div className='flex items-center gap-4'>
                            <RotateCw className='w-5 h-5 text-gray-500 dark:text-gray-400' />
                            <Slider
                                value={[rotation]}
                                min={0}
                                max={360}
                                step={1}
                                onValueChange={(value) => setRotation(value[0])}
                                className='flex-1'
                            />
                            <span className='text-sm text-gray-500 dark:text-gray-400 w-12'>{rotation}°</span>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex justify-end gap-3 pt-2'>
                            <Button variant='outline' onClick={handleCropCancel}>
                                <X className='w-4 h-4 mr-2' />
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleCropConfirm}
                                className='bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                            >
                                <Check className='w-4 h-4 mr-2' />
                                Apply
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default EditProfile