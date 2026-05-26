// Akktivate — mock data
window.AKK_DATA = (() => {
  const LEVELS = [
    { range: [1, 9], tier: "Rookie", color: "#9AA0AB" },
    { range: [10, 19], tier: "Explorer", color: "#5DC9F2" },
    { range: [20, 29], tier: "Pacer", color: "#C6FF3D" },
    { range: [30, 39], tier: "Endurance", color: "#FFB31A" },
    { range: [40, 49], tier: "Elite", color: "#FF4D1A" },
    { range: [50, 50], tier: "Legend", color: "#E6E6FF" },
  ];

  function tierForLevel(lvl) {
    return LEVELS.find(t => lvl >= t.range[0] && lvl <= t.range[1]) || LEVELS[0];
  }

  const user = {
    name: "Marco Aller",
    handle: "@marco.run",
    avatarColor: "#FF4D1A",
    initials: "MA",
    level: 23,
    xp: 14820,
    xpToNext: 16000,
    streak: 18,
    location: "Madrid · Retiro",
    totals: {
      km: 1247,
      activities: 168,
      hours: 142,
      elevation: 18420,
    },
    weekly: {
      km: 38.4,
      activities: 5,
      kcal: 2840,
      goal: 50,
    },
  };

  const activities = [
    { id: "a1", type: "run", title: "Casa de Campo Loop", km: 8.4, time: "42:18", pace: "5:02", date: "Hoy · 07:14", elev: 124 },
    { id: "a2", type: "bike", title: "Sierra Norte Climb", km: 32.1, time: "1:24:50", pace: "22.7 km/h", date: "Ayer · 18:02", elev: 720 },
    { id: "a3", type: "trail", title: "Pinar de las Siete Tetas", km: 12.6, time: "1:08:42", pace: "5:28", date: "Lun · 06:45", elev: 380 },
    { id: "a4", type: "run", title: "Madrid Río Tempo", km: 6.0, time: "27:36", pace: "4:36", date: "Dom · 09:10", elev: 32 },
  ];

  const community = [
    { id: "c1", user: "Lucía Vega", initials: "LV", color: "#C6FF3D", type: "run", title: "Sunset along Manzanares", km: 10.2, time: "48:51", pace: "4:47", kudos: 24, when: "12 min", liked: false },
    { id: "c2", user: "David Roca", initials: "DR", color: "#5DC9F2", type: "bike", title: "Puerto de Navacerrada", km: 64.8, time: "2:46:12", pace: "23.4 km/h", kudos: 41, when: "1 h", liked: true },
    { id: "c3", user: "Ane Pardo", initials: "AP", color: "#FFB31A", type: "trail", title: "Cuerda Larga FKT", km: 24.5, time: "3:12:00", pace: "7:50", kudos: 88, when: "3 h", liked: false },
    { id: "c4", user: "Iván Soler", initials: "IS", color: "#FF4D1A", type: "mtb", title: "Casa de Campo singletrack", km: 18.3, time: "1:14:09", pace: "14.8 km/h", kudos: 17, when: "5 h", liked: false },
    { id: "c5", user: "Núria Camps", initials: "NC", color: "#E6E6FF", type: "run", title: "Intervalos 6×800", km: 7.4, time: "34:02", pace: "4:35", kudos: 32, when: "Ayer", liked: false },
  ];

  const ranking = [
    { rank: 1, user: "Ane Pardo", initials: "AP", color: "#FFB31A", km: 142.6, change: 0 },
    { rank: 2, user: "David Roca", initials: "DR", color: "#5DC9F2", km: 128.4, change: 1 },
    { rank: 3, user: "Lucía Vega", initials: "LV", color: "#C6FF3D", km: 98.2, change: -1 },
    { rank: 4, user: "Marco Aller", initials: "MA", color: "#FF4D1A", km: 92.8, change: 2, isMe: true },
    { rank: 5, user: "Núria Camps", initials: "NC", color: "#E6E6FF", km: 84.0, change: 0 },
    { rank: 6, user: "Iván Soler", initials: "IS", color: "#FF6E3D", km: 76.4, change: -2 },
  ];

  const badges = [
    { id: "b1", name: "Primera Ruta", icon: "flag", desc: "Completa tu primera actividad", unlocked: true, date: "12 mar 2024" },
    { id: "b2", name: "Racha 7 Días", icon: "fire", desc: "7 días seguidos activo", unlocked: true, date: "22 mar 2024" },
    { id: "b3", name: "100 KM", icon: "milestone", desc: "100 km acumulados", unlocked: true, date: "06 abr 2024" },
    { id: "b4", name: "Nocturno", icon: "moon", desc: "Ruta entre 22:00 y 05:00", unlocked: true, date: "19 abr 2024" },
    { id: "b5", name: "Bajo la Lluvia", icon: "rain", desc: "Termina con lluvia activa", unlocked: true, date: "02 may 2024" },
    { id: "b6", name: "Madrugador", icon: "sunrise", desc: "Empieza antes de las 06:00", unlocked: true, date: "17 may 2024" },
    { id: "b7", name: "1000 KM", icon: "milestone-2", desc: "1.000 km acumulados", unlocked: true, date: "28 feb 2025" },
    { id: "b8", name: "Subida Bestia", icon: "mountain", desc: "+1000 m de desnivel positivo", unlocked: true, date: "15 mar 2025" },
    { id: "b9", name: "Velocista", icon: "lightning", desc: "Ritmo bajo 4:00 /km en 5K", unlocked: false },
    { id: "b10", name: "Racha 30 Días", icon: "fire-2", desc: "30 días seguidos activo", unlocked: false },
    { id: "b11", name: "Ultra", icon: "ultra", desc: "Más de 42 km en una salida", unlocked: false },
    { id: "b12", name: "Everesting", icon: "everest", desc: "+8.848 m acumulados", unlocked: false },
  ];

  const samplePOIs = [
    { x: 22, y: 78, label: "Inicio", type: "start" },
    { x: 38, y: 52, label: "Mirador", type: "view" },
    { x: 62, y: 38, label: "Fuente", type: "water" },
    { x: 82, y: 58, label: "Cima", type: "peak" },
    { x: 70, y: 82, label: "Final", type: "end" },
  ];

  return { user, activities, community, ranking, badges, LEVELS, tierForLevel, samplePOIs };
})();
