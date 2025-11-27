import { Injectable } from '@nestjs/common';
import { Device } from '../device/schema/device.schema';
import { LocationName } from 'src/schemas/location_name.schema';
import { LocationCoordinates } from 'src/interfaces/location_coor.interface';

@Injectable()
export class LocationService {
  async getLocationName(
    coor: LocationCoordinates,
  ): Promise<Partial<LocationName>> {
    const URL = `https://us1.locationiq.com/v1/reverse?key=pk.e34742aad85680d4ff0edd1d67d775af&lat=${coor.lat}&lon=${coor.lng}&format=json&`;

    const req = await fetch(URL, {
      method: 'GET',
    });

    const data = await req.json();

    const locationName: Partial<LocationName> = {
      road: data.address?.road ?? '',
      brgy: data.address?.quarter ? `Brgy. ${data.address.quarter}` : '',
      city: data.address?.city ? `${data.address.city} City` : '',
    };

    return locationName;
  }
}
