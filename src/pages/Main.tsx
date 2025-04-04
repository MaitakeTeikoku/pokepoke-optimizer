import React, { useState } from "react";
import {
  Container,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, TextField, Button,
} from "@mui/material";

const rarities = ["◆3", "◆4", "★1"];
const packs = ["A1", "A1a", "A2", "A2a", "A2b"];

type Rarity = (typeof rarities)[number];
type Pack = (typeof packs)[number];
type CalculationResult = {
  pattern: Record<Pack, Record<Rarity, { packPoints: number; tradeMedals: number }>>;
  remainingPackPoints: Record<Pack, number>;
  remainingTradeMedals: number;
  exchangedCards: number;
};

const rarityCosts: Record<Rarity, { packPoints: number; tradeMedals: number }> = {
  "◆3": { packPoints: 150, tradeMedals: 120 },
  "◆4": { packPoints: 500, tradeMedals: 500 },
  "★1": { packPoints: 400, tradeMedals: 400 },
};

const Main: React.FC = () => {
  const [cardCounts, setCardCounts] = useState<Record<Pack, Record<Rarity, number>>>(Object.fromEntries(
    packs.map(pack => [pack, Object.fromEntries(rarities.map(rarity => [rarity, 0]))])
  ) as Record<Pack, Record<Rarity, number>>);

  const [packPoints, setPackPoints] = useState<Record<Pack, number>>(
    Object.fromEntries(packs.map(pack => [pack, 0])) as Record<Pack, number>
  );

  const [tradeMedals, setTradeMedals] = useState<number>(0);
  const [calculationResult, setCalculationResult] = useState<CalculationResult[]>([]);

  const handleCardChange = (pack: Pack, rarity: Rarity, value: string) => {
    setCardCounts(prev => ({
      ...prev,
      [pack]: {
        ...prev[pack],
        [rarity]: Number(value) || 0,
      },
    }));
  };

  const handlePackPointsChange = (pack: Pack, value: string) => {
    setPackPoints(prev => ({ ...prev, [pack]: Number(value) || 0 }));
  };

  const handleTradeMedalsChange = (value: string) => {
    setTradeMedals(Number(value) || 0);
  };

  const calculateOptimalPattern = () => {
    const allPacks = Object.keys(cardCounts) as Pack[];
    const allRarities = Object.keys(rarityCosts) as Rarity[];

    let results: CalculationResult[] = [];

    // 再帰的にすべてのパターンを生成
    const generatePatterns = (
      packIndex: number,
      rarityIndex: number,
      currentPattern: CalculationResult['pattern'],
      remainingPoints: Record<Pack, number>,
      remainingMedals: number,
      exchangedCards: number
    ) => {
      if (packIndex === allPacks.length) {
        results.push({
          pattern: currentPattern,
          remainingPackPoints: remainingPoints,
          remainingTradeMedals: remainingMedals,
          exchangedCards: exchangedCards,
        });
        return;
      }

      const pack = allPacks[packIndex];
      const rarity = allRarities[rarityIndex];
      const count = cardCounts[pack][rarity];
      const cost = rarityCosts[rarity];

      for (let i = 0; i <= count; i++) {
        const newRemainingPoints = { ...remainingPoints };
        const newRemainingMedals = remainingMedals - (count - i);
        if (newRemainingMedals < 0) continue; // トレードメダルが足りない場合はスキップ

        newRemainingPoints[pack] -= i * cost.packPoints;
        if (newRemainingPoints[pack] < 0) continue; // パックポイントが足りない場合はスキップ

        const newPattern = { ...currentPattern };
        if (!newPattern[pack]) newPattern[pack] = {};
        newPattern[pack][rarity] = {
          packPoints: i * cost.packPoints,
          tradeMedals: (count - i) * cost.tradeMedals,
        };

        // 次のパック、または次のレアリティに進む
        if (rarityIndex + 1 < allRarities.length) {
          generatePatterns(packIndex, rarityIndex + 1, newPattern, newRemainingPoints, newRemainingMedals, exchangedCards);
        } else {
          generatePatterns(packIndex + 1, 0, newPattern, newRemainingPoints, newRemainingMedals, exchangedCards);
        }
      }
    };

    generatePatterns(0, 0, {}, packPoints, tradeMedals, 0);

    setCalculationResult(results);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Typography variant="h6">欲しいカードの枚数</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {rarities.map(rarity => (
                <TableCell key={rarity}>{rarity}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {packs.map(pack => (
              <TableRow key={pack}>
                <TableCell>{pack}</TableCell>
                {rarities.map(rarity => (
                  <TableCell key={rarity} sx={{ px: 0.1, py: 0 }}>
                    <TextField
                      type="number"
                      value={cardCounts[pack][rarity]}
                      onChange={(e) => handleCardChange(pack, rarity, e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{
                        "& .MuiInputBase-input": {
                          px: 0.5,
                          textAlign: "right",
                        },
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" sx={{ marginTop: 2 }}>所有パック開封ポイント</Typography>
      {packs.map(pack => (
        <TextField
          key={pack}
          label={pack}
          type="number"
          value={packPoints[pack]}
          onChange={(e) => handlePackPointsChange(pack, e.target.value)}
          variant="outlined"
          size="small"
          sx={{ margin: 1 }}
        />
      ))}

      <Typography variant="h6" sx={{ marginTop: 2 }}>所有トレードメダル</Typography>
      <TextField
        label="トレードメダル"
        type="number"
        value={tradeMedals}
        onChange={(e) => handleTradeMedalsChange(e.target.value)}
        variant="outlined"
        size="small"
        sx={{ margin: 1 }}
      />

      <div style={{ marginTop: 20 }}>
        <Button variant="contained" color="primary" onClick={calculateOptimalPattern}>
          計算を開始
        </Button>
      </div>

      {calculationResult.length > 0 ? (
        calculationResult.map((result, index) => (
          <div key={index}>
            <Typography variant="subtitle1">パターン {index + 1}</Typography>
            <Typography variant="body2">残りパックポイント: {JSON.stringify(result.remainingPackPoints)}</Typography>
            <Typography variant="body2">残りトレードメダル: {result.remainingTradeMedals}</Typography>
            <Typography variant="body2">交換できたカード枚数: {result.exchangedCards}</Typography>
            <pre>{JSON.stringify(result.pattern, null, 2)}</pre>
          </div>
        ))
      ) : (
        <Typography variant="body1">条件を満たすパターンがありません。</Typography>
      )}

    </Container>
  );
};

export default Main;
