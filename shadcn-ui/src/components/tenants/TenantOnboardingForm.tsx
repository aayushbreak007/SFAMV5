import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ApiService, TenantData } from '@/lib/api/api-service';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

// Form schema validation using zod
const tenantFormSchema = z.object({
  name: z.string().min(2, { message: 'Tenant name must be at least 2 characters long' }),
  description: z.string().optional(),
  address: z.string().min(5, { message: 'Address must be at least 5 characters long' }),
  city: z.string().min(2, { message: 'City is required' }),
  state: z.string().min(2, { message: 'State is required' }),
  zipCode: z.string().min(5, { message: 'Zip code is required' }),
  country: z.string().min(2, { message: 'Country is required' }),
  contactName: z.string().min(2, { message: 'Contact name is required' }),
  contactEmail: z.string().email({ message: 'Invalid email address' }),
  contactPhone: z.string().min(10, { message: 'Valid phone number is required' }),
  enableVisitorRegistration: z.boolean().default(true),
  enableEmployeeAccess: z.boolean().default(true),
  enableNotifications: z.boolean().default(true),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

export function TenantOnboardingForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      enableVisitorRegistration: true,
      enableEmployeeAccess: true,
      enableNotifications: true,
    },
  });

  async function onSubmit(data: TenantFormValues) {
    setIsSubmitting(true);
    try {
      await ApiService.createTenant( data as TenantData);
      toast({
        title: 'Success',
        description: 'Tenant has been successfully created',
        variant: 'default',
      });
      form.reset();
    } catch (error: unknown) {
      console.error('Error creating tenant:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create tenant. Please try again.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Tenant Onboarding</CardTitle>
        <CardDescription>
          Create a new tenant organization in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenant Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Contact Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email*</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone*</FormLabel>
                    <FormControl>
                      <Input placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address*</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
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
                    <FormLabel>City*</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province*</FormLabel>
                    <FormControl>
                      <Input placeholder="CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip/Postal Code*</FormLabel>
                    <FormControl>
                      <Input placeholder="94105" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country*</FormLabel>
                    <FormControl>
                      <Input placeholder="United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the tenant organization" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <h3 className="text-lg font-medium">Features</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="enableVisitorRegistration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Visitor Registration</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Enable visitor self-registration and check-in
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableEmployeeAccess"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Employee Access</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Enable employee access management
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Notifications</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Enable email and SMS notifications
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <CardFooter className="flex justify-end px-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Tenant"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}