import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  date: z.string().min(1, {
     message: "Please select a preferred date.",
  }),
  message: z.string().optional(),
});

export default function BookingForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      date: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Request Sent",
      description: "We will confirm your appointment shortly.",
    });
    form.reset();
    if (onSubmitted) {
      onSubmitted();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[9px] font-bold uppercase tracking-widest opacity-40">Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="NAME" {...field} className="rounded-none border-0 border-b border-black px-0 bg-transparent focus-visible:ring-0 focus-visible:border-black transition-colors uppercase text-[10px] tracking-widest font-bold" />
                </FormControl>
                <FormMessage className="text-[9px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[9px] font-bold uppercase tracking-widest opacity-40">Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="EMAIL" {...field} className="rounded-none border-0 border-b border-black px-0 bg-transparent focus-visible:ring-0 focus-visible:border-black transition-colors uppercase text-[10px] tracking-widest font-bold" />
                </FormControl>
                <FormMessage className="text-[9px]" />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[9px] font-bold uppercase tracking-widest opacity-40">Preferred Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} className="rounded-none border-0 border-b border-black px-0 bg-transparent focus-visible:ring-0 focus-visible:border-black transition-colors uppercase text-[10px] tracking-widest font-bold" />
              </FormControl>
              <FormMessage className="text-[9px]" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[9px] font-bold uppercase tracking-widest opacity-40">Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="SPECIFIC REQUESTS" {...field} className="rounded-none border-0 border-b border-black px-0 bg-transparent focus-visible:ring-0 focus-visible:border-black transition-colors min-h-[100px] resize-none uppercase text-[10px] tracking-widest font-bold" />
              </FormControl>
              <FormMessage className="text-[9px]" />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-16 rounded-[8px] bg-black text-white text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-neutral-900 transition-all">Submit Inquiry</Button>
      </form>
    </Form>
  );
}
