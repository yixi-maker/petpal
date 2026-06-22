interface AmapNavigationTarget {
  name: string;
  lng: number;
  lat: number;
}

export function buildAmapNavigationUrl(target: AmapNavigationTarget): string {
  const params = new URLSearchParams({
    to: `${target.lng},${target.lat},${target.name}`,
    mode: 'car',
    policy: '1',
    src: 'petpal',
    coordinate: 'gaode',
    callnative: '1',
  });

  return `https://uri.amap.com/navigation?${params.toString()}`;
}
