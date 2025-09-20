/**
 * Script para upload de CSV FIPE via interface web
 * Este script cria uma API endpoint para receber CSVs e processar automaticamente
 */

const multer = require('multer');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const cors = require('cors');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuração do Multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos CSV são permitidos'), false);
    }
  }
});

class FipeCsvUploader {
  constructor() {
    this.stats = {
      totalRows: 0,
      processedRows: 0,
      errors: 0,
      brands: 0,
      models: 0,
      prices: 0
    };
  }

  /**
   * Processa dados CSV em memória
   */
  async processCsvBuffer(buffer) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      const stream = require('stream');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);

      bufferStream
        .pipe(csv({
          separator: ',', // ou ';' dependendo do CSV
          headers: true,
          skipEmptyLines: true
        }))
        .on('data', (data) => {
          const normalizedData = this.normalizeCsvRow(data);
          if (normalizedData) {
            results.push(normalizedData);
          }
        })
        .on('end', () => {
          console.log(`✅ CSV processado: ${results.length} registros`);
          resolve(results);
        })
        .on('error', (error) => {
          console.error('❌ Erro ao processar CSV:', error);
          reject(error);
        });
    });
  }

  /**
   * Normaliza uma linha do CSV para o formato esperado
   */
  normalizeCsvRow(row) {
    try {
      const normalized = {
        brand_code: row.brand_code || row.codigo_marca || '',
        brand_name: row.brand_name || row.marca || row.Marca || '',
        model_code: row.model_code || row.codigo_modelo || '',
        model_name: row.model_name || row.modelo || row.Modelo || '',
        model_full_name: row.model_full_name || row.nome_completo || row['Nome Completo'] || '',
        year_code: row.year_code || row.codigo_ano || '',
        year_name: row.year_name || row.ano_nome || row['Ano Nome'] || '',
        year_number: parseInt(row.year_number || row.ano || row.Ano || '0'),
        fuel_type: row.fuel_type || row.combustivel || row.Combustivel || '',
        fipe_code: row.fipe_code || row.codigo_fipe || row['Código FIPE'] || '',
        reference_month: row.reference_month || row.referencia_mes || row['Referência Mês'] || new Date().toISOString().slice(0, 7),
        price: parseFloat(row.price || row.preco || row.Preço || '0')
      };

      // Validar dados obrigatórios
      if (!normalized.brand_name || !normalized.model_name || !normalized.fipe_code) {
        return null;
      }

      return normalized;
    } catch (error) {
      console.warn('⚠️ Erro ao normalizar linha:', error.message);
      return null;
    }
  }

  /**
   * Processa dados CSV no Supabase
   */
  async processCsvData(csvData) {
    try {
      console.log('🔄 Processando dados CSV no Supabase...');
      
      const { data, error } = await supabase.rpc('processar_csv_fipe', {
        p_dados_csv: csvData
      });

      if (error) {
        throw new Error(`Erro ao processar CSV: ${error.message}`);
      }

      if (data && data.length > 0) {
        const result = data[0];
        this.stats = {
          totalRows: csvData.length,
          processedRows: result.registros_inseridos || 0,
          errors: 0,
          brands: result.marcas_novas || 0,
          models: result.modelos_novos || 0,
          prices: result.precos_atualizados || 0
        };
      }

      return true;

    } catch (error) {
      console.error('❌ Erro ao processar dados:', error);
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * Processa upload de CSV
   */
  async processUpload(buffer) {
    try {
      // 1. Processar CSV em memória
      const csvData = await this.processCsvBuffer(buffer);
      
      if (csvData.length === 0) {
        throw new Error('Nenhum dado válido encontrado no CSV');
      }

      // 2. Processar no Supabase
      await this.processCsvData(csvData);

      return {
        success: true,
        stats: this.stats,
        message: 'CSV processado com sucesso!'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        stats: this.stats
      };
    }
  }
}

// Instância do processador
const uploader = new FipeCsvUploader();

// Rotas da API

// Rota para upload de CSV
app.post('/api/upload-csv', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo CSV enviado'
      });
    }

    console.log(`📁 Arquivo recebido: ${req.file.originalname} (${req.file.size} bytes)`);

    const result = await uploader.processUpload(req.file.buffer);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        stats: result.stats
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        stats: result.stats
      });
    }

  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para normalizar dados existentes
app.post('/api/normalize-existing', async (req, res) => {
  try {
    console.log('🔄 Normalizando dados existentes...');
    
    const { data, error } = await supabase.rpc('normalizar_dados_fipe');

    if (error) {
      throw new Error(`Erro ao normalizar dados: ${error.message}`);
    }

    const result = data && data.length > 0 ? data[0] : {};

    res.json({
      success: true,
      message: 'Dados normalizados com sucesso!',
      stats: {
        marcas_processadas: result.marcas_processadas || 0,
        modelos_processados: result.modelos_processados || 0,
        precos_processados: result.precos_processados || 0
      }
    });

  } catch (error) {
    console.error('❌ Erro na normalização:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota para verificar estatísticas
app.get('/api/stats', async (req, res) => {
  try {
    const { data: brandsData } = await supabase
      .from('ocar_fipe_brands')
      .select('id', { count: 'exact' });

    const { data: modelsData } = await supabase
      .from('ocar_fipe_models')
      .select('id', { count: 'exact' });

    const { data: pricesData } = await supabase
      .from('ocar_fipe_prices')
      .select('id', { count: 'exact' });

    const { data: transbordoData } = await supabase
      .from('ocar_transbordo')
      .select('id', { count: 'exact' });

    res.json({
      success: true,
      stats: {
        brands: brandsData?.length || 0,
        models: modelsData?.length || 0,
        prices: pricesData?.length || 0,
        transbordo: transbordoData?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota para testar consultas
app.get('/api/test-queries', async (req, res) => {
  try {
    // Testar listar marcas
    const { data: marcas } = await supabase.rpc('listar_marcas');
    
    let exemploPreco = null;
    if (marcas && marcas.length > 0) {
      const marca = marcas[0].name;
      const { data: modelos } = await supabase.rpc('listar_modelos_por_marca', { p_marca: marca });
      
      if (modelos && modelos.length > 0) {
        const modelo = modelos[0].name;
        const { data: precos } = await supabase.rpc('buscar_preco_fipe', {
          p_marca: marca,
          p_modelo: modelo,
          p_ano: 2020
        });
        
        exemploPreco = precos?.[0];
      }
    }

    res.json({
      success: true,
      data: {
        marcas: marcas?.slice(0, 5) || [],
        exemploPreco
      }
    });

  } catch (error) {
    console.error('❌ Erro ao testar consultas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota para servir página de upload
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Upload CSV FIPE</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .container { background: #f5f5f5; padding: 20px; border-radius: 8px; }
            .upload-area { border: 2px dashed #ccc; padding: 40px; text-align: center; margin: 20px 0; }
            .upload-area.dragover { border-color: #007bff; background: #e3f2fd; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #0056b3; }
            .stats { background: white; padding: 15px; border-radius: 4px; margin: 10px 0; }
            .success { color: #28a745; }
            .error { color: #dc3545; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚗 Upload CSV FIPE</h1>
            <p>Faça upload de um arquivo CSV com dados FIPE para processar automaticamente.</p>
            
            <div class="upload-area" id="uploadArea">
                <p>📁 Arraste e solte seu arquivo CSV aqui ou clique para selecionar</p>
                <input type="file" id="fileInput" accept=".csv" style="display: none;">
                <button onclick="document.getElementById('fileInput').click()">Selecionar Arquivo</button>
            </div>
            
            <div id="progress" style="display: none;">
                <p>⏳ Processando arquivo...</p>
            </div>
            
            <div id="result"></div>
            
            <div class="stats">
                <h3>📊 Estatísticas do Sistema</h3>
                <div id="stats">Carregando...</div>
            </div>
            
            <div style="margin-top: 20px;">
                <button onclick="normalizeExisting()">🔄 Normalizar Dados Existentes</button>
                <button onclick="testQueries()">🧪 Testar Consultas</button>
                <button onclick="loadStats()">📊 Atualizar Estatísticas</button>
            </div>
        </div>

        <script>
            const uploadArea = document.getElementById('uploadArea');
            const fileInput = document.getElementById('fileInput');
            const progress = document.getElementById('progress');
            const result = document.getElementById('result');
            const stats = document.getElementById('stats');

            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleFile(files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                }
            });

            async function handleFile(file) {
                if (!file.name.endsWith('.csv')) {
                    showResult('❌ Apenas arquivos CSV são permitidos', 'error');
                    return;
                }

                const formData = new FormData();
                formData.append('csvFile', file);

                progress.style.display = 'block';
                result.innerHTML = '';

                try {
                    const response = await fetch('/api/upload-csv', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        showResult(\`✅ \${data.message}<br>
                            📊 Total: \${data.stats.totalRows}<br>
                            🏷️ Marcas: \${data.stats.brands}<br>
                            🚗 Modelos: \${data.stats.models}<br>
                            💰 Preços: \${data.stats.prices}\`, 'success');
                    } else {
                        showResult(\`❌ \${data.error}\`, 'error');
                    }
                } catch (error) {
                    showResult(\`❌ Erro: \${error.message}\`, 'error');
                } finally {
                    progress.style.display = 'none';
                    loadStats();
                }
            }

            function showResult(message, type) {
                result.innerHTML = \`<div class="\${type}">\${message}</div>\`;
            }

            async function loadStats() {
                try {
                    const response = await fetch('/api/stats');
                    const data = await response.json();
                    
                    if (data.success) {
                        stats.innerHTML = \`
                            <p>🏷️ Marcas: \${data.stats.brands}</p>
                            <p>🚗 Modelos: \${data.stats.models}</p>
                            <p>💰 Preços: \${data.stats.prices}</p>
                            <p>📦 Transbordo: \${data.stats.transbordo}</p>
                        \`;
                    }
                } catch (error) {
                    stats.innerHTML = '❌ Erro ao carregar estatísticas';
                }
            }

            async function normalizeExisting() {
                try {
                    const response = await fetch('/api/normalize-existing', { method: 'POST' });
                    const data = await response.json();
                    
                    if (data.success) {
                        showResult(\`✅ \${data.message}<br>
                            🏷️ Marcas: \${data.stats.marcas_processadas}<br>
                            🚗 Modelos: \${data.stats.modelos_processados}<br>
                            💰 Preços: \${data.stats.precos_processados}\`, 'success');
                    } else {
                        showResult(\`❌ \${data.error}\`, 'error');
                    }
                } catch (error) {
                    showResult(\`❌ Erro: \${error.message}\`, 'error');
                } finally {
                    loadStats();
                }
            }

            async function testQueries() {
                try {
                    const response = await fetch('/api/test-queries');
                    const data = await response.json();
                    
                    if (data.success) {
                        let html = '✅ Consultas funcionando!<br><br>';
                        html += '<strong>Primeiras 5 marcas:</strong><br>';
                        data.data.marcas.forEach(marca => {
                            html += \`• \${marca.name}<br>\`;
                        });
                        
                        if (data.data.exemploPreco) {
                            html += \`<br><strong>Exemplo de preço:</strong><br>\`;
                            html += \`\${data.data.exemploPreco.marca} \${data.data.exemploPreco.modelo} \${data.data.exemploPreco.ano}: R$ \${data.data.exemploPreco.price}\`;
                        }
                        
                        showResult(html, 'success');
                    } else {
                        showResult(\`❌ \${data.error}\`, 'error');
                    }
                } catch (error) {
                    showResult(\`❌ Erro: \${error.message}\`, 'error');
                }
            }

            // Carregar estatísticas ao iniciar
            loadStats();
        </script>
    </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de upload CSV FIPE rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   POST /api/upload-csv - Upload de CSV`);
  console.log(`   POST /api/normalize-existing - Normalizar dados existentes`);
  console.log(`   GET /api/stats - Verificar estatísticas`);
  console.log(`   GET /api/test-queries - Testar consultas`);
});

module.exports = app;
