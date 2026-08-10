import Layout from "@/components/layout";
import BookingForm from "@/components/booking-form";
import studioImage from "@assets/image_1768632360954.png";

export default function BookingPage() {
  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-black">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-black p-8 md:p-16 flex flex-col justify-center">
            <div className="max-w-xl mx-auto w-full">
              <div className="space-y-8 mb-12">
                <h1 className="text-5xl md:text-7xl font-display font-medium uppercase leading-[0.85] tracking-tighter">
                  Request a<br/>
                  <span className="italic font-light">Consultation</span>
                </h1>
                <p className="text-xs uppercase leading-relaxed tracking-widest text-muted-foreground max-w-md">
                  Experience the pinnacle of tailoring. We offer private fittings at our Dhaka studio or digital consultations for international clients. Please complete the form to request an appointment.
                </p>
              </div>
              <BookingForm />
            </div>
          </div>

          {/* Right Column: Image and Details */}
          <div className="lg:col-span-5 flex flex-col min-h-[70vh] lg:min-h-0">
            <div className="flex-grow relative overflow-hidden group border-b border-black">
              <img 
                src={studioImage} 
                alt="Studio Atmosphere" 
                className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/5"></div>
            </div>
            <div className="p-8 md:p-12 bg-neutral-50 grid grid-cols-2 gap-8">
               <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 block">Location</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest block">Gulshan Avenue<br/>Dhaka, Bangladesh</span>
               </div>
               <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 block">Opening Hours</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest block">Mon — Sat<br/>10:00 — 18:00</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
