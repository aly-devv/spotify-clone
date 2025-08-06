import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { useAuth } from "@clerk/clerk-react";
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const AddAlbumDialog = () => {
	const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { getToken, isSignedIn } = useAuth();

	const [newAlbum, setNewAlbum] = useState({
		title: "",
		artist: "",
		releaseYear: new Date().getFullYear(),
	});

	const [imageFile, setImageFile] = useState<File | null>(null);

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
		}
	};

	const handleSubmit = async () => {
	setIsLoading(true);

	try {
		if (!isSignedIn) {
			toast.error("Please sign in to add albums");
			return;
		}

		if (!newAlbum.title.trim()) {
			toast.error("Please enter an album title");
			return;
		}

		if (!newAlbum.artist.trim()) {
			toast.error("Please enter an artist name");
			return;
		}

		if (!imageFile) {
			toast.error("Please upload an album image");
			return;
		}

		const token = await getToken();
		if (!token) {
			toast.error("Authentication failed. Please sign in again.");
			return;
		}

		const formData = new FormData();
		formData.append("title", newAlbum.title.trim());
		formData.append("artist", newAlbum.artist.trim());
		formData.append("releaseYear", newAlbum.releaseYear.toString());
		formData.append("imageFile", imageFile);

		await axiosInstance.post("/admin/albums", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
				"Authorization": `Bearer ${token}`,
			},
		});

		toast.success("Album created successfully");

		// ✅ Reset state first, then close dialog
		resetForm();
		setAlbumDialogOpen(false);
	} catch (error: any) {
		console.error("Error creating album:", error);
		if (error.response?.status === 401) {
			toast.error("Authentication failed. Please sign in again.");
		} else if (error.response?.status === 403) {
			toast.error("Admin access required. You don't have permission to add albums.");
		} else {
			toast.error("Failed to create album: " + (error.response?.data?.message || error.message));
		}
	} finally {
		// ✅ Ensure loading stops regardless of error
		setIsLoading(false);
	}
};


	const resetForm = () => {
		setNewAlbum({
			title: "",
			artist: "",
			releaseYear: new Date().getFullYear(),
		});
		setImageFile(null);
	};

	const handleDialogClose = (open: boolean) => {
		setAlbumDialogOpen(open);
		if (!open && !isLoading) {
			resetForm();
		}
	};

	return (
		<Dialog open={albumDialogOpen} onOpenChange={handleDialogClose}>
			<DialogTrigger asChild>
				<Button className='bg-violet-500 hover:bg-violet-600 text-white'>
					<Plus className='mr-2 h-4 w-4' />
					Add Album
				</Button>
			</DialogTrigger>
			<DialogContent className='bg-zinc-900 border-zinc-700'>
				<DialogHeader>
					<DialogTitle>Add New Album</DialogTitle>
					<DialogDescription>Add a new album to your collection</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-4'>
					<input
						type='file'
						ref={fileInputRef}
						onChange={handleImageSelect}
						accept='image/*'
						className='hidden'
					/>
					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors'
						onClick={() => fileInputRef.current?.click()}
					>
						<div className='text-center'>
							{imageFile ? (
								<div className='space-y-2'>
									<div className='text-sm text-violet-500'>Image selected:</div>
									<div className='text-xs text-zinc-400'>{imageFile.name.slice(0, 30)}</div>
								</div>
							) : (
								<>
									<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
										<Upload className='h-6 w-6 text-zinc-400' />
									</div>
									<div className='text-sm text-zinc-400 mb-2'>Upload album artwork</div>
									<Button variant='outline' size='sm' className='text-xs'>
										Choose File
									</Button>
								</>
							)}
						</div>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Album Title *</label>
						<Input
							value={newAlbum.title}
							onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Enter album title'
							required
						/>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Artist *</label>
						<Input
							value={newAlbum.artist}
							onChange={(e) => setNewAlbum({ ...newAlbum, artist: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Enter artist name'
							required
						/>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Release Year</label>
						<Input
							type='number'
							value={newAlbum.releaseYear}
							onChange={(e) => setNewAlbum({ ...newAlbum, releaseYear: parseInt(e.target.value) || new Date().getFullYear() })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Enter release year'
							min={1900}
							max={new Date().getFullYear() + 1}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button 
						variant='outline' 
						onClick={() => handleDialogClose(false)} 
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						className='bg-violet-500 hover:bg-violet-600'
						disabled={isLoading || !imageFile || !newAlbum.title.trim() || !newAlbum.artist.trim()}
					>
						{isLoading ? "Creating..." : "Add Album"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export default AddAlbumDialog;