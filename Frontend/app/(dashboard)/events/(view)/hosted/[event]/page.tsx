import { apiUrl } from "@/components/noncomponents";
import { cookies } from "next/headers";
import { userEvents } from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { event: string } }) {
  const { event } = await params;
  const cookieStore = cookies().get("accessToken")?.value;
  const auth = cookies().get("auth")
  if (cookieStore) {
    const parsedCookie = JSON.parse(cookieStore);
    const actValue = parsedCookie.act;
    const user = parsedCookie.user;
    const arr = event.split("sstc")
    apiUrl.defaults.headers.common["Authorization"] = actValue
    const response = await apiUrl.get(`/events/data?user=${user}&status=${arr[arr.length - 1]}`);
    const eventId = arr[0]
    const object = response.data;
    if(object?.["success"]){
      const objectData : userEvents [] = object.data
      const checkEvent = objectData.filter((curr)=> (curr.eventId==eventId && curr.accType=='Host'))
      if(checkEvent.length>0){
        console.log('access to the event granted!')
        return null;
      }else{
        console.log("Accessing restricted routes.....redirecting back to events!")
        redirect("/events");
      }
    }
    return null
  }
  return null
}
