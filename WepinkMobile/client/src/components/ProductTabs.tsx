import { useState } from "react";

interface ProductTabsProps {
  description: string;
  notes: string;
  usage: string;
}

export default function ProductTabs({ description, notes, usage }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Descrição', content: description },
    { id: 'notes', label: 'Notas', content: notes },
    { id: 'usage', label: 'Modo de usar', content: usage }
  ];

  return (
    <div className="px-4 mb-8">
      <div className="border-b border-border mb-4">
        <div className="flex space-x-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`py-3 px-1 text-sm font-medium ${
                activeTab === tab.id 
                  ? 'tab-active' 
                  : 'text-muted-foreground'
              }`}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="tab-content" data-testid={`content-${activeTab}`}>
        {activeTab === 'description' && (
          <div dangerouslySetInnerHTML={{ __html: description }} className="text-foreground leading-relaxed" />
        )}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Notas de Saída</h4>
              <p className="text-muted-foreground">Bergamota, Toranja, Pêssego, Coco</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Notas de Coração</h4>
              <p className="text-muted-foreground">Harmonia floral elegante</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Notas de Fundo</h4>
              <p className="text-muted-foreground">Fundo doce e amadeirado</p>
            </div>
          </div>
        )}
        {activeTab === 'usage' && (
          <p className="text-foreground leading-relaxed">{usage}</p>
        )}
      </div>
    </div>
  );
}
