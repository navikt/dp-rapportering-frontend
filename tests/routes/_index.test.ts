// // @vitest-environment node
// import { rapporteringsperioderResponse } from "mocks/responses/rapporteringsperioderResponse";
// import { HttpResponse, http } from "msw";
// import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
// import { loader } from "~/routes/_index/route";
// import { server } from "../../mocks/server";
// import { endSessionMock, mockSession } from "../helpers/auth-helper";
// import { catchErrorResponse } from "../helpers/response-helper";

// describe("Hovedside rapportering", () => {
//   beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
//   afterAll(() => server.close());
//   afterEach(() => {
//     server.resetHandlers();
//     endSessionMock();
//   });

//   describe("Loader: ", () => {
//     test("Skal feile hvis bruker ikke er logget på", async () => {
//       const response = await catchErrorResponse(() =>
//         loader({
//           request: new Request("http://localhost:3000"),
//           params: {},
//           context: {},
//         })
//       );

//       expect(response.status).toBe(500);
//     });

//     test("Skal feile hvis kallet til rapporteringsperioder feilet", async () => {
//       server.use(
//         http.get(
//           `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder`,
//           () => {
//             return HttpResponse.json(null, { status: 500 });
//           },
//           {
//             once: true,
//           }
//         )
//       );

//       mockSession();

//       const response = await catchErrorResponse(() =>
//         loader({
//           request: new Request("http://localhost:3000"),
//           params: {},
//           context: {},
//         })
//       );

//       expect(response.status).toBe(500);
//     });

//     test("Skal hente ut rapporteringsperioder", async () => {
//       server.use(
//         http.get(`${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder`, () => {
//           return HttpResponse.json(rapporteringsperioderResponse, { status: 200 });
//         })
//       );

//       mockSession();

//       const response = await loader({
//         request: new Request("http://localhost:3000"),
//         params: {},
//         context: {},
//       });

//       const data = await response.json();

//       expect(response.status).toBe(200);
//       expect(data.rapporteringsperioder).toEqual(rapporteringsperioderResponse);
//     });

//     test("Skal vise at bruker har ingen rapporteringsperiode", async () => {
//       mockSession();

//       const response = await loader({
//         request: new Request("http://localhost:3000"),
//         params: {},
//         context: {},
//       });

//       const data = await response.json();

//       expect(response.status).toBe(200);
//       expect(data.rapporteringsperioder).toEqual([]);
//     });
//   });
// });
