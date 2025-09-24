const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const equipamentos = [];

  fs.createReadStream('equipamentos.csv')
    .pipe(csv({ separator: ';' }))
    .on('data', (row) => {
      equipamentos.push({
        nome: row.equipamento,
        descricao: row.descricao,
        imagemUrl: row.imagem,
        ativo: row.ativo === '1' || row.ativo.toLowerCase() === 'true',
        dataInclusao: new Date(row.data)
      });
    })
    .on('end', async () => {
      console.log('CSV lido, populando o banco...');

      for (const equipamento of equipamentos) {
        await prisma.equipamento.create({
          data: equipamento
        });
      }

      console.log('Banco populado com sucesso!');
      await prisma.$disconnect();
    });
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
