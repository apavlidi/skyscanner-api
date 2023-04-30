import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SearchSDK } from './helpers/sdk/flight';
import type { IndicitiveQuote, IndicitiveLeg, SkyscannerAPIIndicitiveResponse } from './helpers/sdk/indicitive';
import { skyscanner } from './helpers/sdk/flight';
import { getPrice } from './helpers/sdk/price';
import { Search } from './helpers/dto/flight';
import { ChatGPTDescription } from './helpers/dto/chatgpt';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiExcludeEndpoint,
  ApiParam,
  ApiProperty,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as contentful from 'contentful'


@Module({
  imports: [HttpModule],
  providers: [AppService],
})
@Controller()
export class AppController {
  CONTENTFUL_SPACE = '';
  CONTENTFUL_ENVIRONMENT = '';
  CONTENTFUL_ACCESS_TOKEN = '';

  constructor(private readonly appService: AppService, private configService: ConfigService,) {
    this.CONTENTFUL_SPACE =
      this.configService.get<string>('CONTENTFUL_SPACE') || '';
    this.CONTENTFUL_ENVIRONMENT =
      this.configService.get<string>('CONTENTFUL_ENVIRONMENT') || '';
    this.CONTENTFUL_ACCESS_TOKEN =
      this.configService.get<string>('CONTENTFUL_ACCESS_TOKEN') || '';
  }

  @Get('/poll/:token')
  @ApiExcludeEndpoint()
  async getPoll(@Param() params: { token: string }): Promise<any> {
    const res = await this.appService.flightsLivePricesPoll(params.token);

    return res.data;
  }

  @Get('/create')
  @ApiExcludeEndpoint()
  async getCreate(
    @Query()
    query: {
      from: string;
      to: string;
      depart: string;
      return: string;
    },
  ): Promise<any> {
    const res = await this.appService.flightsLivePricesCreate(query);

    return res.data;
  }

  @Get('/price')
  @ApiExcludeEndpoint()
  async getPrice(
    @Query()
    query: {
      from: string;
      month?: number;
      groupType?: string;
    },
  ): Promise<any> {
    const res = await this.appService.flightsIndicitiveSearch(query);

    return res.data;
  }

  @Get('/markets')
  @ApiExcludeEndpoint()
  async getMarkets(): Promise<any> {
    const res = await this.appService.cultureMarkets();

    return res.data;
  }

  @Get('/locales')
  @ApiExcludeEndpoint()
  async getLocales(): Promise<any> {
    const res = await this.appService.cultureLocales();

    return res.data;
  }

  @Get('/currencies')
  @ApiExcludeEndpoint()
  async getCurrenciess(): Promise<any> {
    const res = await this.appService.cultureCurrencies();

    return res.data;
  }

  @Get('/geo')
  @ApiExcludeEndpoint()
  async getGeo(): Promise<any> {
    const res = await this.appService.geo();

    return res.data;
  }
  @Get('/autosuggest/flights/:search')
  @ApiExcludeEndpoint()
  async getAutoSuggestFlights(
    @Param() params: { search: string },
  ): Promise<any> {
    const res = await this.appService.autoSuggestFlights(params.search);

    return res.data;
  }

  @Get('/search')
  @ApiExcludeEndpoint()
  @ApiResponse({
    status: 200,
    description: 'Creates a flight search',
    type: Search,
  })
  @ApiQuery({ name: 'from', required: true, description: 'IATA location flight origin' })
  @ApiQuery({ name: 'to', required: true, description: 'IATA location flight destination' })
  @ApiQuery({ name: 'depart', required: true, description: 'Depature date of the flight in yyyy-mm-dd format' })
  @ApiQuery({ name: 'return', required: false, description: 'Return date of the flight in yyyy-mm-dd format' })
  async getSearch(
    @Query()
    query: {
      from: string;
      to: string;
      depart: string;
      return: string;
    },
  ): Promise<any> {
    console.log('/search endpoint accessed')
    const res = await this.appService.flightsLivePricesSearchChatGPT(query);
    const data = skyscanner(res.data).search();

    return data;
  }

  @Get('/search/:token')
  @ApiExcludeEndpoint()
  @ApiParam({ name: 'token', required: true, description: 'sessionToken from the create search `/create` endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Returns flight search using token to get full results',
  })
  async getSearchPoll(@Param() params: { token: string }): Promise<any> {
    const res = await this.appService.flightsLivePricesPoll(params.token);
    const data = skyscanner(res.data).search();

    return data;
  }

  @Get('/hotel/search')
  @ApiExcludeEndpoint()
  async getHotelSearch(
    @Query()
    query: {
      from: string;
      to: string;
      depart: string;
      return: string;
      entityId: string;
    },
  ): Promise<any> {
    const res = await this.appService.searchHotels(query);
    const data = res.data;

    return data;
  }



  @Get('/search-simple/:from/:to/:depart/')
  @ApiResponse({
    status: 200,
    description: 'Creates a flight search',
    type: Search,
  })
  @ApiParam({ name: 'from', required: true, description: 'IATA location flight origin', schema: { type: 'string' } })
  @ApiParam({ name: 'to', required: true, description: 'IATA location flight destination', schema: { type: 'string' } })
  @ApiParam({ name: 'depart', required: true, description: 'Depature date of the flight in yyyy-mm-dd format', schema: { type: 'string' } })
  @ApiQuery({ name: 'return', required: false, description: 'Return date of the flight in yyyy-mm-dd format', schema: { type: 'string' } })
  async getSearchSimple(
    @Param() params: { from: string, to: string, depart: string, return?: string },
    @Query()
    queryString: {
      return: string;
    },
  ): Promise<any> {
    //setup variables
    const pollTimeout = 2000;
    const endpointTimeout = 5000;
<<<<<<< HEAD
    const maxPolls = 5;
    const maxFlights = 500;
=======
    const maxPolls = 200;
    const maxFlights = 5;
>>>>>>> c4a11570912293d3318b8b1baccfb5415028f376
    const start = Date.now();
    const getExcecutionTime = () => {
      return Date.now() - start;
    };
    const query = {
      from: params.from,
      to: params.to,
      depart: params.depart,
      return: queryString.return || '',
    };
    const buildUrl = () => {
      return `https://flights.owenmerry.com/search/${query.from}/${query.to}/${query.depart}/${query.return}`;
    }

    // run create
    const res = await this.appService.flightsLivePricesSearchChatGPT(query);
    let data = skyscanner(res.data).search();
    const dataSaved = skyscanner(res.data).search();
    const sessionToken = data.sessionToken;

    // setup poll function
    const pollFlights = (token: string) => new Promise<SearchSDK>(async (resolve) => {
      const resPoll = await this.appService.flightsLivePricesPollChatGPT(token, { timeout: pollTimeout });
      if (!resPoll) {
        console.log('came back with false');
        return resolve(dataSaved);
      }
      const pollData = skyscanner(resPoll.data).search();

      resolve({
        ...pollData,
        flights: pollData.flights.slice(0, maxFlights),
      });
    })

    // run polls
    for (let pollCount = 1; pollCount < maxPolls + 1; pollCount++) {
      data = await pollFlights(sessionToken);
      console.log(`check poll ${pollCount} stats`, data.status);
      if (data.status === 'RESULT_STATUS_COMPLETE' || getExcecutionTime() > endpointTimeout) {
        console.log(`Poll finsihed on poll ${pollCount}`, data.status, getExcecutionTime());
        return {
          ...data,
          poll: pollCount,
          time: getExcecutionTime(),
          searchUrl: buildUrl(),
        };
      }
      console.log(`poll ${pollCount}`, data.status);
    }

    // end search
    console.log(`Poll got to max polls`, data.status, getExcecutionTime());
    return { ...data, poll: 'end', time: getExcecutionTime() };

  }

  @Get('/chatgpt')
  @ApiExcludeEndpoint()
  async getChatGpt(): Promise<any> {
    const contentful = require('contentful');

    const client = contentful.createClient({
      space: this.CONTENTFUL_SPACE,
      environment: this.CONTENTFUL_ENVIRONMENT,
      accessToken: this.CONTENTFUL_ACCESS_TOKEN
    })

    const entries = await client.getEntries({
      content_type: 'endpoint',
      limit: 1,
    })

    return entries.items[0].fields.response;
  }

  @Get('/chatgpt/open-api')
  @ApiExcludeEndpoint()
  async getChatGptOpenApi(): Promise<any> {

    const client = contentful.createClient({
      space: this.CONTENTFUL_SPACE,
      environment: this.CONTENTFUL_ENVIRONMENT,
      accessToken: this.CONTENTFUL_ACCESS_TOKEN
    })

    const entries = await client.getEntries({
      content_type: 'endpoint',
      limit: 1,
    });

    return entries.items[0].fields.openApi;
  }


<<<<<<< HEAD
  @Get('/chatgpt/description')
  @ApiResponse({
    status: 200,
    description: 'Get a the best deal for a certain loction',
    type: ChatGPTDescription,
  })
  @ApiQuery({ name: 'from', required: true, description: 'Get location you want to fly from as a IATA code', schema: { type: 'string' } })
  async getPriceChatGpt(
    @Query()
    query: {
      from: string;
      month?: number;
      groupType?: string;
    },
  ): Promise<any> {
    const res = await this.appService.flightsIndicitiveSearchChatGPT(query);
    const search = res.data;
    const sortByPrice = (quoteGroups: IndicitiveQuote[]) => {
      const sorted = quoteGroups.sort(function (a, b) {
        const quoteA: any = search?.content.results.quotes[a.quoteIds[0]];
        const quoteB: any = search?.content.results.quotes[b.quoteIds[0]];

        return quoteA.minPrice.amount - quoteB.minPrice.amount;
      });

      return sorted;
    }
    const addPlaces = (items: IndicitiveQuote[], search: SkyscannerAPIIndicitiveResponse) => {
      const itemsUpdated = items.map((item) => {
        const quotes = item.quoteIds.map((quoteId) => search.content.results.quotes[quoteId]);
        const price = getPrice(quotes[0].minPrice.amount, quotes[0].minPrice.unit);
        const checked = quotes[0].inboundLeg.quoteCreationTimestamp > quotes[0].outboundLeg.quoteCreationTimestamp ? quotes[0].inboundLeg.quoteCreationTimestamp : quotes[0].outboundLeg.quoteCreationTimestamp;
        const checkedDate = new Date(checked);
        return {
          ...item,
          originPlace: search.content.results.places[quotes[0].outboundLeg.originPlaceId],
          destinationPlace: search.content.results.places[quotes[0].outboundLeg.destinationPlaceId],
          destinationCountry: search.content.results.places[item.destinationPlaceId],
          quotes,
          price,
          checkedDate
        }
      })

      return itemsUpdated;
    };

    const sortedByPrice = addPlaces(sortByPrice(search.content.groupingOptions.byRoute.quotesGroups).filter((item) => search.content.results.places[item.destinationPlaceId].iata !== '' || 1 === 1), search);

    return {
      deal: `You can fly to ${sortedByPrice[0].destinationPlace.name}, ${sortedByPrice[0].destinationCountry.name} (${sortedByPrice[0].destinationPlace.iata}) for ${sortedByPrice[0].price} which is the cheapest deal we have found. You can see this flight search at https://www.skyscanner.net/transport/flights/${sortedByPrice[0].originPlace.iata}/${sortedByPrice[0].destinationPlace.iata}/230${sortedByPrice[0].quotes[0].inboundLeg.departureDateTime.month}${sortedByPrice[0].quotes[0].inboundLeg.departureDateTime.day}/230${sortedByPrice[0].quotes[1].inboundLeg.departureDateTime.month}${sortedByPrice[0].quotes[1].inboundLeg.departureDateTime.day}/`,
    }

    //return sortedByPrice;
  }

}
=======
}
>>>>>>> c4a11570912293d3318b8b1baccfb5415028f376
