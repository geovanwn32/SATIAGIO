# Plano de Implementação: Módulo de Compras com Integração de Estoque

## Objetivo
Desenvolver completamente o módulo de Compras com integração total ao módulo de Estoque, incluindo:
1. Implementação das funções dos botões de ações
2. Adição de botão para adicionar produtos comprados ao estoque
3. Integração automática com o módulo de Estoque

## Análise Atual

### Estado Atual do Módulo de Compras
- ✅ Interface de listagem de compras
- ✅ Formulário de nova compra
- ✅ Seleção de produtos do catálogo
- ✅ Carrinho de compras
- ⚠️ Botão de visualizar detalhes (Eye) - **Não implementado**
- ⚠️ Botão de excluir (Trash2) - **Parcialmente implementado** (apenas confirmação)
- ❌ Botão de editar - **Não existe**
- ❌ Integração com estoque - **Não implementada**
- ❌ Visualização de detalhes da compra - **Não implementada**

### Problemas Identificados
1. Ao salvar uma compra, o estoque dos produtos NÃO é atualizado
2. Não há view de detalhes da compra
3. Falta botão de editar compra
4. Não há histórico de movimentação de estoque

## Tarefas de Implementação

### Tarefa 1: Criar View de Detalhes da Compra
**Prioridade:** Alta
**Complexidade:** Média

**Descrição:**
Implementar uma visualização completa dos detalhes de uma compra, similar à view de detalhes de vendas.

**Componentes:**
- Informações do fornecedor
- Data da compra
- Lista de itens comprados (produto, quantidade, preço unitário, subtotal)
- Total da compra
- Botões de ação (Editar, Excluir, Imprimir, Voltar)

**Arquivos afetados:**
- `components/Purchases.tsx`

---

### Tarefa 2: Implementar Função de Edição de Compra
**Prioridade:** Alta
**Complexidade:** Média

**Descrição:**
Adicionar funcionalidade para editar compras existentes.

**Funcionalidades:**
- Carregar dados da compra no formulário
- Permitir modificação de fornecedor, itens e quantidades
- Atualizar estoque ao editar (reverter mudanças antigas e aplicar novas)
- Validações de estoque (não permitir reduzir quantidade se já foi vendido)

**Arquivos afetados:**
- `components/Purchases.tsx`
- `App.tsx` (atualização da função `onUpdatePurchase`)

---

### Tarefa 3: Integração com Estoque - Entrada de Produtos
**Prioridade:** CRÍTICA
**Complexidade:** Alta

**Descrição:**
Implementar a lógica de atualização automática do estoque quando uma compra é confirmada.

**Funcionalidades:**
- Ao salvar compra: incrementar `product.stock` de cada item
- Ao editar compra: ajustar estoque (reverter entrada antiga, aplicar nova)
- Ao excluir compra: decrementar estoque (com validação)
- Registrar histórico de movimentação

**Lógica de Negócio:**
```typescript
// Ao salvar nova compra
purchase.items.forEach(item => {
  const product = products.find(p => p.id === item.productId);
  product.stock += item.quantity;
  // Atualizar produto no banco
});

// Ao editar compra
// 1. Reverter entrada antiga
oldPurchase.items.forEach(item => {
  product.stock -= item.quantity;
});
// 2. Aplicar nova entrada
newPurchase.items.forEach(item => {
  product.stock += item.quantity;
});

// Ao excluir compra
purchase.items.forEach(item => {
  const product = products.find(p => p.id === item.productId);
  if (product.stock < item.quantity) {
    throw new Error('Não é possível excluir: estoque insuficiente');
  }
  product.stock -= item.quantity;
});
```

**Arquivos afetados:**
- `App.tsx` (funções `handleSavePurchase`, `handleUpdatePurchase`, `handleDeletePurchase`)
- `components/Purchases.tsx`

---

### Tarefa 4: Adicionar Histórico de Movimentação de Estoque
**Prioridade:** Média
**Complexidade:** Alta

**Descrição:**
Criar um sistema de rastreamento de todas as movimentações de estoque.

**Novo Tipo:**
```typescript
export interface StockMovement {
  id: string;
  productId: string;
  type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN';
  quantity: number; // positivo para entrada, negativo para saída
  referenceId: string; // ID da compra/venda relacionada
  date: string;
  userId?: string;
  notes?: string;
}
```

**Funcionalidades:**
- Registrar toda entrada (compra)
- Registrar toda saída (venda)
- Exibir histórico no módulo de Estoque
- Filtros por produto, período, tipo

**Arquivos afetados:**
- `types.ts` (novo tipo)
- `App.tsx` (novo estado e funções)
- `components/Inventory.tsx` (exibir histórico)

---

### Tarefa 5: Melhorias na UI do Módulo de Compras
**Prioridade:** Baixa
**Complexidade:** Baixa

**Descrição:**
Melhorias visuais e de usabilidade.

**Melhorias:**
- Adicionar botão "Editar" na lista de compras
- Melhorar feedback visual ao adicionar itens
- Adicionar confirmação antes de excluir
- Exibir toast de sucesso/erro nas operações
- Adicionar indicador de loading durante operações

**Arquivos afetados:**
- `components/Purchases.tsx`

---

### Tarefa 6: Validações e Regras de Negócio
**Prioridade:** Alta
**Complexidade:** Média

**Descrição:**
Implementar validações robustas.

**Validações:**
1. **Ao criar compra:**
   - Fornecedor obrigatório
   - Pelo menos 1 item
   - Quantidades > 0
   - Preços > 0

2. **Ao editar compra:**
   - Mesmas validações de criação
   - Verificar se estoque permite reversão

3. **Ao excluir compra:**
   - Verificar se há estoque suficiente para reverter entrada
   - Confirmar ação com usuário

**Arquivos afetados:**
- `components/Purchases.tsx`
- `App.tsx`

---

## Ordem de Implementação Recomendada

1. **Tarefa 3** - Integração com Estoque (CRÍTICA)
2. **Tarefa 1** - View de Detalhes
3. **Tarefa 2** - Função de Edição
4. **Tarefa 6** - Validações
5. **Tarefa 4** - Histórico de Movimentação
6. **Tarefa 5** - Melhorias na UI

## Estimativa de Tempo

- Tarefa 1: 1-2 horas
- Tarefa 2: 2-3 horas
- Tarefa 3: 3-4 horas (CRÍTICA)
- Tarefa 4: 4-5 horas
- Tarefa 5: 1 hora
- Tarefa 6: 2 horas

**Total estimado:** 13-17 horas

## Riscos e Considerações

1. **Sincronização de Dados:** Garantir que as atualizações de estoque sejam atômicas
2. **Validação de Estoque:** Prevenir estoque negativo
3. **Histórico:** Manter integridade do histórico mesmo com edições/exclusões
4. **Performance:** Otimizar queries ao listar produtos com estoque

## Próximos Passos

Após aprovação do plano, iniciar pela **Tarefa 3** (Integração com Estoque), pois é a funcionalidade crítica solicitada pelo usuário.
