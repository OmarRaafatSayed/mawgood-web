import { useState } from 'react';

import { RocketLaunch } from '@medusajs/icons';

import { MawgoodConnectItem } from './components/mawgood-connect-item/mawgood-connect-item';
import { MawgoodConnectModal } from './components/mawgood-connect-modal/mawgood-connect-modal';
import { mawgoodConnectItems } from './const';

export const MawgoodConnect = () => {
  const [openPrompt, setOpenPrompt] = useState(false);

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-3">
        {mawgoodConnectItems.map(item => (
          <MawgoodConnectItem
            key={item.name}
            item={item}
            onOpenPrompt={setOpenPrompt}
          />
        ))}
        <MawgoodConnectItem
          item={{
            name: 'More comming soon',
            description:
              'We’re expanding Mawgood Connect with new integrations and tools designed to streamline you workflows. Stay tuned – or contact us to learn more.',
            enabled: false,
            icon: <RocketLaunch />,
            provider: 'more'
          }}
        />
      </div>
      <MawgoodConnectModal
        open={openPrompt}
        onOpenChange={setOpenPrompt}
        testId="mawgood-connect-modal"
      />
    </>
  );
};
