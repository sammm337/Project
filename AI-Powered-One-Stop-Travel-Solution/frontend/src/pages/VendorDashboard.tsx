import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, X, MapPin, IndianRupee, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { createPackage } from '../api/vendor';
import { toast } from '../components/ui/use-toast';

interface PropertyForm {
  vendorId: string;
  title: string;
  description: string;
  price: number;
  city: string;
  state: string;
  tags: string;
}

export default function VendorDashboard() {
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PropertyForm>({
    defaultValues: {
      vendorId: 'demo-vendor', // Keeps your working demo ID
      title: '',
      description: '',
      price: 0,
      city: '',
      state: '',
      tags: ''
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PropertyForm) => {
    if (images.length === 0) {
      toast({
        title: "Missing Images",
        description: "Please upload at least one image of the property.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Construct the Location JSON object manually
      const locationData = JSON.stringify({
        city: data.city,
        state: data.state,
        country: 'India' // Defaulting for now
      });

      // We need to modify createPackage to accept 'location' string if it doesn't already
      // But looking at api/vendor.ts, we should append it to FormData.
      
      // Since createPackage in api/vendor.ts takes a specific payload, 
      // we will construct the FormData manually here to be safe and flexible.
      const formData = new FormData();
      formData.append('vendorId', data.vendorId);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('location', locationData);
      formData.append('tags', JSON.stringify(data.tags.split(',').map(t => t.trim())));
      
      images.forEach((img) => formData.append('images', img));

      // Direct fetch to bypass type strictness of existing helper if needed, 
      // or update api/vendor.ts (We will update api/vendor.ts next)
      await createPackage(formData as any); 

      toast({ 
        title: 'Property Listed!', 
        description: 'Your package has been created successfully.' 
      });
      
      reset();
      setImages([]);
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: (error as Error).message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-brand-200">Vendor Console</p>
        <h2 className="text-3xl font-semibold">List Your Property</h2>
        <p className="text-slate-400">Add details, upload photos, and start selling instantly.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-8 space-y-8">
        
        {/* Basic Info Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-medium text-white border-b border-white/10 pb-2">Basic Details</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title</Label>
              <Input id="title" placeholder="e.g. Sunset Villa in Manali" {...register('title', { required: true })} />
              {errors.title && <span className="text-red-400 text-xs">Title is required</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (per person/night)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input id="price" type="number" className="pl-9" placeholder="2500" {...register('price', { required: true })} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              className="min-h-[120px]" 
              placeholder="Describe the experience, amenities, and vibe..." 
              {...register('description', { required: true })} 
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-medium text-white border-b border-white/10 pb-2">Location</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input id="city" className="pl-9" placeholder="e.g. Manali" {...register('city', { required: true })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" placeholder="e.g. Himachal Pradesh" {...register('state', { required: true })} />
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-medium text-white border-b border-white/10 pb-2">Gallery</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((file, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="preview" 
                  className="w-full h-full object-cover transition group-hover:scale-105" 
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-black/50 p-1 rounded-full hover:bg-red-500/80 transition"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
            
            <label className="border-2 border-dashed border-white/20 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-brand-400/50 hover:bg-white/5 transition">
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <span className="text-xs text-slate-400">Add Image</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Publishing...
              </>
            ) : (
              'Create Listing'
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}