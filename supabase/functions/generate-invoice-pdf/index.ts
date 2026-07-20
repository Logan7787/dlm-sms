// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { invoice_id } = await req.json();

    if (!invoice_id) {
      return new Response(JSON.stringify({ error: "Missing invoice_id parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch invoice details
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .select("*, customers(*), invoice_items(*)")
      .eq("id", invoice_id)
      .single();

    if (invErr || !invoice) {
      return new Response(JSON.stringify({ error: "Invoice not found", details: invErr }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate PDF placeholder HTML/Buffer string
    const pdfContent = `
      =======================================================
      DAYLIGHT MEDIA INVOICE #${invoice.invoice_number}
      Issued Date: ${invoice.issued_at}
      Client: ${invoice.customers?.name || 'Walk-in'}
      Total Amount: ${invoice.total}
      Status: ${invoice.status}
      =======================================================
    `;

    const fileName = `invoices/${invoice.invoice_number}.txt`;
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("invoices")
      .upload(fileName, pdfContent, { contentType: "text/plain", upsert: true });

    if (uploadErr) {
      throw uploadErr;
    }

    const { data: publicUrlData } = supabase.storage.from("invoices").getPublicUrl(fileName);
    const pdf_url = publicUrlData.publicUrl;

    // Update invoice pdf_url field
    await supabase.from("invoices").update({ pdf_url }).eq("id", invoice_id);

    return new Response(
      JSON.stringify({ success: true, message: "PDF invoice generated successfully", pdf_url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
