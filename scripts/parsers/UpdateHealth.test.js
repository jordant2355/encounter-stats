/**
 * @jest-environment jsdom
 */
import UpdateHealth from "./UpdateHealth.js";
import { duplicate } from "../mocks/helpers.js";
global.duplicate = duplicate;
import { combatantStats } from "../mockdata/combatantStats.js";
import { updateHealth } from "../mockdata/updateHealth.js";
jest.mock("../StatManager.js");
import { GetStat, SaveStat } from "../StatManager.js";

GetStat.mockImplementation(() => combatantStats);
SaveStat.mockImplementation(() => true);

describe("UpdateHealth", () => {
  test("it has an itemId assigned", async () => {
    const result = await UpdateHealth(updateHealth);
    expect(result).toStrictEqual({
      encounterId: "RwzeJBOvutLp3eeL",
      round: 1,
      combatants: [
        {
          name: "Lorena Aldabra",
          id: "5H4YnyD6zf9vcJ3P",
          img: "tokens/pcs/lorena/lorena_topdown_resting.png",
          type: "character",
          tokenId: "hoTFHXIbChPmVzQq",
          hp: 71,
          max: 76,
          ac: 16,
          events: [
            {
              id: null,
              actionType: "mwak",
              round: 1,
              tokenId: "hoTFHXIbChPmVzQq",
              actorId: "5H4YnyD6zf9vcJ3P",
              advantage: false,
              isCritical: false,
              isFumble: false,
              disadvantage: false,
              attackTotal: 18,
              damageTotal: 0,
              item: {
                name: "Flame Tongue Greatsword",
                itemLink:
                  "@Compendium[dnd5e.items.WWb4vAmh18sMAxfY]{Flame Tongue Greatsword}",
              },
            },
            {
              id: null,
              actionType: "mwak",
              round: 1,
              tokenId: "hoTFHXIbChPmVzQq",
              actorId: "5H4YnyD6zf9vcJ3P",
              advantage: false,
              isCritical: false,
              isFumble: false,
              disadvantage: false,
              attackTotal: 0,
              damageTotal: 0,
              item: {
                name: "Flame Tongue Greatsword",
                itemLink:
                  "@Compendium[dnd5e.items.WWb4vAmh18sMAxfY]{Flame Tongue Greatsword}",
              },
            },
          ],
          health: [],
          summaryList: { min: 0, max: 0, avg: 0, total: 0 },
          roundSummary: {
            individual: {
              1: [
                {
                  damageTotal: 2,
                  round: 1,
                },
              ],
              2: [
                {
                  damageTotal: 4,
                  round: 2,
                },
                {
                  damageTotal: 4,
                  round: 2,
                },
              ],
            },
            totals: [
              {
                damageTotal: 2,
                round: "1",
              },
              {
                damageTotal: 8,
                round: "2",
              },
            ],
          },
        },
        {
          name: "Displacer Beast",
          id: "39qXw7GSzTEwGW2G",
          img: "tokens/npcs/Phase_Panther_Large_Monstrosity_05.png",
          type: "npc",
          tokenId: "39qXw7GSzTEwGW2D",
          hp: 85,
          max: 85,
          ac: 13,
          events: [],
          health: [],
          summaryList: { min: "0", max: "0", avg: "0", total: "0" },
          roundSummary: {
            individual: {
              1: [
                {
                  damageTotal: 2,
                  round: 1,
                },
              ],
              2: [
                {
                  damageTotal: 4,
                  round: 2,
                },
                {
                  damageTotal: 4,
                  round: 2,
                },
              ],
            },
            totals: [
              {
                damageTotal: 2,
                round: "1",
              },
              {
                damageTotal: 8,
                round: "2",
              },
            ],
          },
        },
      ],
      templateHealthCheck: [],
      top: {
        maxDamage: "Lorena Aldabra<br />0",
        mostDamageInOneTurn: "Lorena Aldabra<br />16",
        highestAvgDamage: "Lorena Aldabra<br />0",
        highestMaxDamage: "Lorena Aldabra<br />0",
      },
    });
  });
});
