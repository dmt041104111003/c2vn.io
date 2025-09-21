"use client";

import { useState, useEffect } from "react";
import { PenSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import EventCard from "~/components/home/CTAEventCard";
import CTALoadingGrid from "~/components/home/CTALoadingGrid";
import EditModal from "~/components/home/CTAEditModal";
import { Event } from "~/constants/events";

export default function CTASection() {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);

  const { data: userData, error: userDataError } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      if (!session?.user) return null;

      const sessionUser = session.user as { address?: string; email?: string };
      const url = new URL("/api/user", window.location.origin);
      if (sessionUser.address) url.searchParams.set("address", sessionUser.address);
      if (sessionUser.email) url.searchParams.set("email", sessionUser.email);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch user role");
      return response.json();
    },
    enabled: !!session?.user,
  });



  useEffect(() => {
    const adminStatus = userData?.data?.role?.name === "ADMIN";
    setIsAdmin(adminStatus);
  }, [userData]);

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorEvents, setErrorEvents] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      setLoadingEvents(true);
      setErrorEvents(null);

      try {
        const res = await fetch("/api/event-images");
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data?.data || []);
      } catch (err: any) {
        setErrorEvents(err.message || "Unknown error");

      } finally {
        setLoadingEvents(false);
      }
    }
    fetchEvents();
  }, []);

  const handleEditClick = (index: number) => {
    setSelectedEventIndex(index);
    setModalOpen(true);
  };

  const handleSaveEvent = (index: number, updatedEvent: Partial<Event>) => {
    const updated = [...events];
    const eventIndex = updated.findIndex(e => e.orderNumber === index);
    if (eventIndex !== -1) {
      updated[eventIndex] = { ...updated[eventIndex], ...updatedEvent };
    } else {
      updated.push({ ...updatedEvent, orderNumber: index } as Event);
    }
    setEvents(updated);
  };

  const handleImageUpload = (file: File, index: number) => {
    const fakeUrl = URL.createObjectURL(file);
    const updated = [...events];
    updated[index].imageUrl = fakeUrl;
    setEvents(updated);
  };

  const handleToggleEdit = () => {
    if (editMode) {
      (async () => {
        setLoadingEvents(true);
        try {
          const res = await fetch("/api/admin/event-images");
          if (!res.ok) throw new Error("Failed to fetch events");
          const data = await res.json();
          setEvents(data?.data || []);
        } finally {
          setLoadingEvents(false);
        }
      })();
    }
    setEditMode(!editMode);
  };

  // if (errorEvents) return <p className="text-red-500">Error loading events: {errorEvents}</p>;
  // if (userData === undefined) return <p>Loading user info...</p>;

  const sortedEvents = [...events].sort((a, b) => a.orderNumber - b.orderNumber);

  return (
    <section id="CTA" className="w-full border-t border-gray-200 dark:border-gray-700 scroll-mt-28 md:scroll-mt-40">
      <div className="mx-auto w-5/6 max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-20">
        {/* HEADER */}
        <div className="mb-8 lg:mb-16 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="mb-4 lg:mb-6 flex items-center gap-2 lg:gap-4">
              <div className="h-1 w-8 lg:w-12 bg-gradient-to-r from-blue-500 to-transparent" />
              <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">Events</h2>
            </div>
      
          </div>
          {isAdmin && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleEdit}
                className={`flex items-center gap-1 pb-1 transition border-b-2 ${
                  editMode ? "text-blue-500 border-blue-500" : "text-gray-400 border-transparent hover:text-blue-500 hover:border-blue-500"
                }`}
              >
                {editMode ? (
                  "Exit edit mode"
                ) : (
                  <>
                    <PenSquare className="mr-1" size={16} /> Edit
                  </>
                )}
              </button>
            </div>
          )}
        </div>

     
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <EventCard
              event={sortedEvents[0] || { id: '0', title: '', location: '', imageUrl: '', orderNumber: 0 }}
              index={0}
              editMode={editMode}
              onEditClick={handleEditClick}
              onUpload={handleImageUpload}
              className="lg:w-[70%] h-70"
            />
            <EventCard
              event={sortedEvents[1] || { id: '1', title: '', location: '', imageUrl: '', orderNumber: 1 }}
              index={1}
              editMode={editMode}
              onEditClick={handleEditClick}
              onUpload={handleImageUpload}
              className="lg:w-[30%] h-70"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex flex-col sm:flex-row gap-6 lg:w-[70%]">
              <EventCard
                event={sortedEvents[2] || { id: '2', title: '', location: '', imageUrl: '', orderNumber: 2 }}
                index={2}
                editMode={editMode}
                onEditClick={handleEditClick}
                onUpload={handleImageUpload}
                className="sm:w-1/2 h-70"
              />
              <EventCard
                event={sortedEvents[3] || { id: '3', title: '', location: '', imageUrl: '', orderNumber: 3 }}
                index={3}
                editMode={editMode}
                onEditClick={handleEditClick}
                onUpload={handleImageUpload}
                className="sm:w-1/2 h-70"
              />
            </div>

            <div className="flex flex-col gap-6 lg:w-[30%]">
              <EventCard
                event={sortedEvents[4] || { id: '4', title: '', location: '', imageUrl: '', orderNumber: 4 }}
                index={4}
                editMode={editMode}
                onEditClick={handleEditClick}
                onUpload={handleImageUpload}
                className="h-32"
              />
              <EventCard
                event={sortedEvents[5] || { id: '5', title: '', location: '', imageUrl: '', orderNumber: 5 }}
                index={5}
                editMode={editMode}
                onEditClick={handleEditClick}
                onUpload={handleImageUpload}
                className="h-32"
              />
            </div>
          </div>
        </div>

        {/* MODAL */}
        {selectedEventIndex !== null && (
          <EditModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            event={events[selectedEventIndex] || { id: selectedEventIndex.toString(), title: '', location: '', imageUrl: '', orderNumber: selectedEventIndex }}
            index={selectedEventIndex}
            onSave={handleSaveEvent}
          />
        )}
      </div>
    </section>
  );
}
