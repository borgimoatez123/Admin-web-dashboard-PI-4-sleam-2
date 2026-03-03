'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Vehicle } from '@/types';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/services/vehicleService';
import { Loader2, Plus, Pencil, Trash2, Search, MoreHorizontal, AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/services/authService';

const VEHICLE_MODELS = ['SAVES_PROTOTYPE_V1', 'SAVES_miniPROTOTYPE_V1'] as const;
const VEHICLE_VARIANTS = ['SUV', 'SEDAN'] as const;
const VEHICLE_COLORS = [
  'Matte Black',
  'Black',
  'White',
  'Silver',
  'Gray',
  'Red',
  'Blue',
  'Green',
] as const;
const TUNISIA_STATES = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'Manouba',
  'Nabeul',
  'Zaghouan',
  'Bizerte',
  'Beja',
  'Jendouba',
  'Kef',
  'Siliana',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Gabes',
  'Medenine',
  'Tataouine',
  'Gafsa',
  'Tozeur',
  'Kebili',
] as const;

const TUNISIA_STATES_COORDS = {
  Tunis: { latitude: 36.8065, longitude: 10.1815 },
  Ariana: { latitude: 36.8665, longitude: 10.1647 },
  'Ben Arous': { latitude: 36.7435, longitude: 10.231 },
  Manouba: { latitude: 36.8093, longitude: 10.0955 },
  Nabeul: { latitude: 36.4561, longitude: 10.7376 },
  Zaghouan: { latitude: 36.4029, longitude: 10.1429 },
  Bizerte: { latitude: 37.2746, longitude: 9.8739 },
  Beja: { latitude: 36.7256, longitude: 9.1817 },
  Jendouba: { latitude: 36.5011, longitude: 8.7802 },
  Kef: { latitude: 36.1826, longitude: 8.7148 },
  Siliana: { latitude: 36.0848, longitude: 9.3708 },
  Sousse: { latitude: 35.8256, longitude: 10.6084 },
  Monastir: { latitude: 35.7643, longitude: 10.8113 },
  Mahdia: { latitude: 35.5047, longitude: 11.0622 },
  Sfax: { latitude: 34.7406, longitude: 10.7603 },
  Kairouan: { latitude: 35.6781, longitude: 10.0963 },
  Kasserine: { latitude: 35.1676, longitude: 8.8365 },
  'Sidi Bouzid': { latitude: 35.0382, longitude: 9.4849 },
  Gabes: { latitude: 33.8815, longitude: 10.0982 },
  Medenine: { latitude: 33.3549, longitude: 10.5055 },
  Tataouine: { latitude: 32.9297, longitude: 10.4518 },
  Gafsa: { latitude: 34.4311, longitude: 8.7757 },
  Tozeur: { latitude: 33.9197, longitude: 8.1335 },
  Kebili: { latitude: 33.7044, longitude: 8.969 },
} as const satisfies Record<(typeof TUNISIA_STATES)[number], { latitude: number; longitude: number }>;

const vehicleSchema = z.object({
  model: z.enum(VEHICLE_MODELS),
  variant: z.enum(VEHICLE_VARIANTS),
  plateNumber: z.string().min(1, 'Plate Number is required'),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.enum(VEHICLE_COLORS),
  pricePerDay: z.coerce.number().min(0),
  city: z.enum(TUNISIA_STATES),
});

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [agencyNameFilter, setAgencyNameFilter] = useState<string | undefined>(undefined);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await getVehicles(1, 100, statusFilter, search);
      const all: Vehicle[] = (data.vehicles || []) as Vehicle[];
      const filtered: Vehicle[] = agencyNameFilter
        ? all.filter((v: Vehicle) => (v.agency?.name ?? '').trim().toLowerCase() === agencyNameFilter.trim().toLowerCase())
        : all;
      setVehicles(filtered);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((u) => {
      if (!mounted) return;
      setAgencyNameFilter(u?.agencyName);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [search, statusFilter, agencyNameFilter]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(id);
        toast.success('Vehicle deleted');
        fetchVehicles();
      } catch (error) {
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const handleQuickStatusUpdate = async (id: string, status: any) => {
    try {
      await updateVehicle(id, { status });
      toast.success(`Vehicle marked as ${status}`);
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openAddDialog = () => {
    setEditingVehicle(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Available</Badge>;
      case 'BOOKED':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Booked</Badge>;
      case 'MAINTENANCE':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">Maintenance</Badge>;
      case 'STOLEN':
        return <Badge variant="destructive" className="animate-pulse">STOLEN</Badge>;
      case 'ACCIDENT':
        return <Badge variant="destructive">ACCIDENT</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plate number..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="BOOKED">Booked</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="STOLEN">Stolen</SelectItem>
            <SelectItem value="ACCIDENT">Accident</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Plate Number</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Price/Day</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Agency City</TableHead>
              <TableHead>Agency</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No vehicles found.
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow 
                  key={vehicle.id}
                  className={vehicle.status === 'STOLEN' || vehicle.status === 'ACCIDENT' ? 'bg-red-50 hover:bg-red-100' : ''}
                >
                  <TableCell className="font-medium">{vehicle.model}</TableCell>
                  <TableCell>{vehicle.variant}</TableCell>
                  <TableCell>{vehicle.plateNumber}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>${vehicle.pricePerDay}</TableCell>
                  <TableCell>
                    {getStatusBadge(vehicle.status)}
                  </TableCell>
                  <TableCell>{vehicle.city}</TableCell>
                  <TableCell>{vehicle.agency?.location?.city ?? '-'}</TableCell>
                  <TableCell>{vehicle.agency?.name ?? '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(vehicle)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleQuickStatusUpdate(vehicle.id, 'AVAILABLE')}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Mark Available
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickStatusUpdate(vehicle.id, 'BOOKED')}>
                            <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                            Mark Booked
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickStatusUpdate(vehicle.id, 'STOLEN')}>
                            <ShieldAlert className="mr-2 h-4 w-4 text-red-500" />
                            Report Stolen
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickStatusUpdate(vehicle.id, 'ACCIDENT')}>
                            <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                            Report Accident
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(vehicle.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <VehicleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        vehicle={editingVehicle}
        onSuccess={fetchVehicles}
      />
    </div>
  );
}

function VehicleDialog({
  open,
  onOpenChange,
  vehicle,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onSuccess: () => void;
}) {
  const form = useForm<z.input<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      model: 'SAVES_PROTOTYPE_V1',
      variant: 'SUV',
      plateNumber: '',
      year: new Date().getFullYear(),
      color: 'Matte Black',
      pricePerDay: 0,
      city: 'Tunis',
    },
  });

  useEffect(() => {
    if (vehicle) {
      form.reset({
        model: (VEHICLE_MODELS.includes((vehicle.model ?? '') as any) ? (vehicle.model as any) : 'SAVES_PROTOTYPE_V1'),
        variant: (vehicle.variant?.toUpperCase?.() === 'SEDAN' ? 'SEDAN' : 'SUV'),
        plateNumber: vehicle.plateNumber,
        year: vehicle.year,
        color: (VEHICLE_COLORS.includes((vehicle.color ?? '') as any) ? (vehicle.color as any) : 'Matte Black'),
        pricePerDay: vehicle.pricePerDay,
        city: (TUNISIA_STATES.includes((vehicle.city ?? '') as any) ? (vehicle.city as any) : 'Tunis'),
      });
    } else {
      form.reset({
        model: 'SAVES_PROTOTYPE_V1',
        variant: 'SUV',
        plateNumber: '',
        year: new Date().getFullYear(),
        color: 'Matte Black',
        pricePerDay: 0,
        city: 'Tunis',
      });
    }
  }, [vehicle, form, open]);

  const onSubmit = async (values: z.input<typeof vehicleSchema>) => {
    try {
      const parsed = vehicleSchema.parse(values);
      const coords = TUNISIA_STATES_COORDS[parsed.city];
      const location = { city: parsed.city, lat: coords.latitude, lng: coords.longitude };
      if (vehicle) {
        await updateVehicle(vehicle.id, { ...parsed, status: vehicle.status, location });
        toast.success('Vehicle updated');
      } else {
        await createVehicle({ ...parsed, status: 'AVAILABLE', location });
        toast.success('Vehicle created');
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{vehicle ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
          <DialogDescription>
            {vehicle ? 'Update vehicle details. Status is managed from the table actions.' : 'Create a new vehicle. Status will be available by default.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_MODELS.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="variant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select variant" />
                        </SelectTrigger>
                        <SelectContent>
                          {VEHICLE_VARIANTS.map((v) => (
                            <SelectItem key={v} value={v}>{v.toLowerCase()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plate Number</FormLabel>
                    <FormControl>
                      <Input placeholder="TUN-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            {VEHICLE_COLORS.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {TUNISIA_STATES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={typeof field.value === 'number' && Number.isFinite(field.value) ? field.value : ''}
                          onChange={(e) => {
                            if (e.target.value === '') {
                              field.onChange('');
                              return;
                            }
                            field.onChange(e.target.valueAsNumber);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pricePerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price/Day</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={typeof field.value === 'number' && Number.isFinite(field.value) ? field.value : ''}
                          onChange={(e) => {
                            if (e.target.value === '') {
                              field.onChange('');
                              return;
                            }
                            field.onChange(e.target.valueAsNumber);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter showCloseButton>
              <Button type="submit">{vehicle ? 'Save Changes' : 'Create Vehicle'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
