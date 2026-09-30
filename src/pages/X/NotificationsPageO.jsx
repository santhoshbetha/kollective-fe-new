import {
  useNotificationsQuery,
  useMarkNotificationsRead,
  useToggleFollowUser
} from '../features/notifications/useNotificationsFeature';

export const NotificationsPageO = () => {

  const { notifications, notificationsLoading } = useNotificationsQuery();
  const markNotificationsAsRead = useMarkNotificationsRead();
  const toggleFollowUser = useToggleFollowUser();

  const handleMarkAllRead = () => {
    markNotificationsAsRead();
  };

  const handleFollowBack = (username) => {
    toggleFollowUser(username);
  };

  if (notificationsLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 text-scale-large">
      {/* Header and Controls */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="font-display-lg text-3xl font-extrabold text-text-primary mb-2">Notifications</h1>
          <p className="text-lg text-text-secondary">Stay updated with the collective pulse.</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1 text-primary-container hover:text-white transition-colors text-xlg font-bold uppercase tracking-wider cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">done_all</span>
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-4">
        {!notifications || notifications.length === 0 ? (
          <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-surface-ink">
            <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">
              notifications
            </span>
            <h3 className="font-bold text-text-primary mb-2 text-lg">No notifications yet</h3>
            <p className="text-text-secondary text-sm">We'll let you know when something exciting happens!</p>
          </div>
        ) : (
          notifications.map((n) => {
            const hasLeftBar = n.unread;
            return (
              <div
                key={n.id}
                className={`glass-panel rounded-2xl p-6 border relative overflow-hidden transition-all duration-300 flex items-start gap-4 ${hasLeftBar
                  ? 'border-l-4 border-l-primary-container border-white/10 bg-surface-crimson-low/5'
                  : 'border-white/5 bg-surface-ink'
                  }`}
              >
                {/* Visual Accent for Unread Notification */}
                {n.unread && (
                  <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-primary-container"></div>
                )}

                {/* Avatar / Icon wrapper */}
                {n.user ? (
                  <div className={`w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 p-[1px] ${hasLeftBar ? 'border-primary-container' : 'border-white/10'
                    }`}>
                    <img
                      alt={n.user.name}
                      className="w-full h-full rounded-full object-cover"
                      src={n.user.avatar}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0 border border-white/5">
                    <span className="material-symbols-outlined text-primary-container">
                      {n.type === 'event' ? 'calendar_month' : 'notifications'}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      {n.type === 'like' && (
                        <p className="text-lg text-text-primary">
                          <strong className="font-bold">{n.user.name}</strong> liked your post <span className="text-primary-container font-semibold italic">"{n.postTitle}"</span>
                        </p>
                      )}
                      {n.type === 'follow' && (
                        <p className="text-lg text-text-primary">
                          <strong className="font-bold">{n.user.name}</strong> started following you
                        </p>
                      )}
                      {n.type === 'comment' && (
                        <p className="text-lg text-text-primary">
                          <strong className="font-bold">{n.user.name}</strong> commented on your pulse
                        </p>
                      )}
                      {n.type === 'event' && (
                        <p className="text-lg text-text-primary font-bold">
                          Event starting soon: {n.title}
                        </p>
                      )}
                      {n.type === 'highlight' && (
                        <p className="text-lg text-text-primary">
                          <strong className="font-bold">{n.user.name}</strong> {n.title}
                        </p>
                      )}

                      {n.description && (
                        <p className="text-lg text-text-secondary">{n.description}</p>
                      )}

                      {n.commentText && (
                        <blockquote className="border-l border-white/10 pl-3 py-1 mt-2 text-lg text-text-secondary italic">
                          "{n.commentText}"
                        </blockquote>
                      )}
                    </div>
                    <span className="text-[15px] text-text-secondary whitespace-nowrap">{n.time}</span>
                  </div>

                  {/* Actions / Sub-indicators */}
                  <div className="pt-2 flex items-center gap-3">
                    {n.type === 'like' && (
                      <span className="flex items-center gap-1 text-[12px] font-bold text-primary-container bg-primary-container/10 border border-primary-container/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          favorite
                        </span>
                        New Like
                      </span>
                    )}

                    {n.type === 'comment' && (
                      <span className="flex items-center gap-1 text-[12px] font-bold text-text-primary bg-surface-container-high border border-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[12px]">
                          chat_bubble
                        </span>
                        Comment
                      </span>
                    )}

                    {n.type === 'highlight' && (
                      <span className="flex items-center gap-1 text-[12px] font-bold text-text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                        Community Highlight
                      </span>
                    )}

                    {n.type === 'follow' && (
                      <button
                        onClick={() => handleFollowBack(n.user.name)}
                        className={`px-4 py-1.5 rounded-lg text-lg font-bold uppercase tracking-wider active:scale-95 transition-all cursor-pointer ${n.following
                          ? 'bg-surface-container-high border border-white/5 text-text-secondary'
                          : 'bg-primary-container text-white crimson-glow'
                          }`}
                      >
                        {n.following ? 'Following ✓' : 'Follow Back'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Older Notifications Button */}
        {notifications && notifications.length > 0 && (
          <button
            onClick={() => alert('Viewing older notifications...')}
            className="w-full py-3 bg-surface-container border border-white/5 rounded-xl text-lg font-bold text-text-secondary hover:text-text-primary transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>View Older Notifications</span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        )}
      </div>
    </div>
  );
};
