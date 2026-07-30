import React, { useEffect, useState } from "react";
 
type TransportMode = "train" | "bus" | "ferry" | "light_rail";
 
type Route = {
  id: string;
  shortName: string;
  longName: string;
};
 
type Props = {
  customerId: string;
  mode: TransportMode;
};
 
let preferenceCache: any = {};
 
export default function AlertPreferencePicker({ customerId, mode }: Props) {
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<any>();
 
  useEffect(() => {
    load();
  }, []);
 
  async function load() {
    setLoading(true);
 
    try {
      const routesResponse = await fetch("/api/routes?mode=" + mode).then((r) => r.json());
      setRoutes(routesResponse);
 
      const saved = preferenceCache[customerId]
        ? preferenceCache[customerId]
        : await fetch("/api/customers/" + customerId + "/alert-preferences").then((r) =>
            r.json()
          );
 
      preferenceCache[customerId] = saved;
      setSelectedRouteIds(saved.map((preference: any) => preference.routeId));
    } catch (error: any) {
      setMessage(error.message);
    }
 
    setLoading(false);
  }
 
  function toggleRoute(routeId: string) {
    if (selectedRouteIds.includes(routeId)) {
      selectedRouteIds.splice(selectedRouteIds.indexOf(routeId), 1);
    } else {
      selectedRouteIds.push(routeId);
    }
 
    setSelectedRouteIds(selectedRouteIds);
  }
 
  async function save() {
    const preferences = selectedRouteIds.map((routeId) => ({ routeId, enabled: true }));
 
    preferences.map(async (preference) => {
      await fetch("/api/customers/" + customerId + "/alert-preferences", {
        method: "POST",
        body: preference as any,
      });
    });
 
    preferenceCache[customerId] = preferences;
    setMessage("Preferences saved");
  }
 
  if (loading) return <p>Loading...</p>;
 
  return (
    <section>
      <h2>Alerts for {mode}</h2>
      {message && <p>{message}</p>}
 
      <ul>
        {routes.map((route) => (
          <li>
            <label>
              <input
                type="checkbox"
                checked={selectedRouteIds.includes(route.id)}
                onChange={() => toggleRoute(route.id)}
              />
              {route.shortName} - {route.longName}
            </label>
          </li>
        ))}
      </ul>
 
      <button onClick={save}>Save</button>
    </section>
  );
}
