import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { createPackage } from '../api/vendor';
import { toast } from '../components/ui/use-toast';

interface PackageForm {
  vendorId: string;
  title: string;
  description: string;
  price: number;
  tags: string;
}

export default function VendorCreatePackage() {
  const { register, handleSubmit, reset } = useForm<PackageForm>({
    defaultValues: {
      vendorId: 'demo-vendor',
      title: '',
      description: '',
      price: 2000,
      tags: 'Nature,Local'
    }
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: PackageForm) => {
    setLoading(true);
    try {
      await createPackage({
        vendorId: data.vendorId,
        title: data.title,
        description: data.description,
        price: Number(data.price),
        tags: data.tags.split(',').map((tag) => tag.trim())
      });
      toast({ title: 'Package submitted', description: 'Pending agent enrichment.' });
      reset();
    } catch (error) {
      toast({
        title: 'Failed to submit package',
        description: (error as Error).message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-brand-200">Vendor</p>
        <h2 className="text-3xl font-semibold">Create listing manually</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="glass-panel grid gap-4 p-6">
        <div>
          <Label>Vendor ID</Label>
          <Input className="mt-1" {...register('vendorId')} />
        </div>
        <div>
          <Label>Title</Label>
          <Input className="mt-1" {...register('title')} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea className="mt-1" {...register('description')} />
        </div>
        <div>
          <Label>Price INR</Label>
          <Input type="number" className="mt-1" {...register('price')} />
        </div>
        <div>
          <Label>Tags (comma separated)</Label>
          <Input className="mt-1" {...register('tags')} />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Create package'}
        </Button>
      </form>
    </div>
  );
}

