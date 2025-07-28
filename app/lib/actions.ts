'use server';
import { z } from 'zod';
import postgres from 'postgres';
// to clear cache and trigger a new request to server
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';

// connect to postgress
const sql = postgres(process.env.POSTGRES_URL!,{ssl:'require'})


// For validating the data 
const FormSchema = z.object({ 
  id:z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount:z.coerce.number().gt(0,{message:'Please enter amount greater tahn $0.'}),
  status:z.enum(['pending','paid'],{
    invalid_type_error:'Please select an invoice status.'
  }),
  date: z.string(),

})
// for validating
const CreateInvoice = FormSchema.omit({id:true,date:true});

// Submission logic
export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  try{

  await sql `INSERT INTO invoices(customer_id,amount,status,date) VALUES (${customerId},${amountInCents},${status},${date})`;
  }catch(error){
    console.log(error);

  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}


// update the database

const UpdateInvoice = FormSchema.omit({id:true,date:true});

export async function updateInvoice(id: string,formData: FormData) {
  const {  customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),

  });
  const amountInCents = amount *100;
  try{
  await sql `UPDATE invoices SET customer_Id =${customerId},amount=${amountInCents},status=${status} WHERE ID = ${id}`;
  }catch(error){
    console.log(error);
  }

  revalidatePath(`/dashboard/invoices`);
  redirect(`/dashboard/invoices`)
}


export async function deleteInvoice(id: string) {
 await sql`DELETE FROM invoices WHERE id = ${id}`;
 revalidatePath('/dashboard/invoices')
}
