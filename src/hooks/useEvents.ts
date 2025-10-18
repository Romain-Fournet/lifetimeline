import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type { TimelineEvent } from "../pages/Timeline";

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer tous les événements de l'utilisateur
  useEffect(() => {
    if (!user?.id) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("events")
          .select("*")
          .eq("user_id", user.id)
          .order("start_date", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        // Transformer les données de la BDD au format TimelineEvent
        const transformedEvents: TimelineEvent[] = (data || []).map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: new Date(event.start_date),
          endDate: event.end_date ? new Date(event.end_date) : undefined,
          category_id: event.category_id,
          location: event.location,
          photos: event.photos,
          metadata: event.metadata,
        }));

        setEvents(transformedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err instanceof Error ? err.message : "Error fetching events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user?.id]);

  // Créer un nouvel événement
  const createEvent = async (eventData: Omit<TimelineEvent, "id">) => {
    if (!user?.id) {
      throw new Error("No user logged in");
    }

    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from("events")
        .insert({
          user_id: user.id,
          title: eventData.title,
          description: eventData.description,
          start_date: eventData.startDate.toISOString(),
          end_date: eventData.endDate?.toISOString(),
          category_id: eventData.category_id,
          location: eventData.location,
          photos: eventData.photos,
          metadata: eventData.metadata,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Ajouter le nouvel événement à la liste
      const newEvent: TimelineEvent = {
        id: data.id,
        title: data.title,
        description: data.description,
        startDate: new Date(data.start_date),
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        category_id: data.category_id,
        location: data.location,
        photos: data.photos,
        metadata: data.metadata,
      };

      setEvents((prev) => [newEvent, ...prev]);
      return { data: newEvent, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error creating event";
      setError(errorMessage);
      console.error("Error creating event:", err);
      return { data: null, error: errorMessage };
    }
  };

  // Mettre à jour un événement
  const updateEvent = async (
    eventId: string,
    updates: Partial<Omit<TimelineEvent, "id">>
  ) => {
    if (!user?.id) {
      throw new Error("No user logged in");
    }

    try {
      setError(null);

      const updateData: Record<string, unknown> = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.startDate)
        updateData.start_date = updates.startDate.toISOString();
      if (updates.endDate !== undefined)
        updateData.end_date = updates.endDate?.toISOString();
      if (updates.category_id) updateData.category_id = updates.category_id;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.photos !== undefined) updateData.photos = updates.photos;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

      const { data, error: updateError } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", eventId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Mettre à jour l'événement dans la liste
      const updatedEvent: TimelineEvent = {
        id: data.id,
        title: data.title,
        description: data.description,
        startDate: new Date(data.start_date),
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        category_id: data.category_id,
        location: data.location,
        photos: data.photos,
        metadata: data.metadata,
      };

      setEvents((prev) =>
        prev.map((event) => (event.id === eventId ? updatedEvent : event))
      );
      return { data: updatedEvent, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error updating event";
      setError(errorMessage);
      console.error("Error updating event:", err);
      return { data: null, error: errorMessage };
    }
  };

  // Supprimer un événement
  const deleteEvent = async (eventId: string) => {
    if (!user?.id) {
      throw new Error("No user logged in");
    }

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId)
        .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Retirer l'événement de la liste
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      return { error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error deleting event";
      setError(errorMessage);
      console.error("Error deleting event:", err);
      return { error: errorMessage };
    }
  };

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
