// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (_req: Request) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query low stock items from items_with_stock view
    const { data: lowStockItems, error } = await supabase
      .from("items_with_stock")
      .select("*")
      .eq("is_low_stock", true);

    if (error) throw error;

    console.log(`[LOW STOCK ALERT] Found ${lowStockItems?.length || 0} low stock items.`);

    // If Resend API key is set, send email alert to admins
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey && lowStockItems && lowStockItems.length > 0) {
      const emailBody = lowStockItems
        .map((i) => `- ${i.name} (SKU: ${i.sku}): Current stock ${i.stock_on_hand} ${i.unit} (Reorder level: ${i.reorder_level})`)
        .join("\n");

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "alerts@daylightmedia.com",
          to: ["admin@daylightmedia.com"],
          subject: `🚨 Photo Studio Low Stock Alert (${lowStockItems.length} items)`,
          text: `The following studio materials are currently at or below reorder level:\n\n${emailBody}`,
        }),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: lowStockItems?.length || 0,
        items: lowStockItems,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
