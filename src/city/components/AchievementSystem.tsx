import { useEffect, useState } from "react";
import { Award, Lock, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BADGES } from "@/city/state/game-state";
import { DISTRICTS } from "@/city/data/districts";
import { portfolio } from "@/data/portfolio";
import { useCity } from "@/city/state/CityProvider";

export const ProgressTracker = () => {
  const { xp, maxXp, percent, badges, progress, reset } = useCity();
  const [confirm, setConfirm] = useState(false);
  return (
    <Dialog onOpenChange={() => setConfirm(false)}>
      <DialogTrigger asChild>
        <button type="button" className="sc-xp" aria-label={`Progress: ${xp} XP, ${percent} percent explored`}>
          <span className="sc-xp-bar" aria-hidden="true"><i style={{ width: `${percent}%` }} /></span>
          <b>{xp} XP</b>
        </button>
      </DialogTrigger>
      <DialogContent className="sc-progress-dialog">
        <DialogTitle className="sc-dialog-title">Exploration progress</DialogTitle>
        <DialogDescription className="sc-dialog-text">
          Exploration XP shows how much of this site you have explored. It is not a measure of professional skill or experience, and it is stored only in this browser.
        </DialogDescription>
        <div className="sc-progress-summary">
          <div className="sc-meter-big" role="img" aria-label={`${percent} percent explored`}><span style={{ width: `${percent}%` }} /></div>
          <p><b>{xp}</b> of {maxXp} XP · {percent}% explored</p>
          <ul>
            <li>{progress.discovered.length} of {DISTRICTS.length} districts discovered</li>
            <li>{progress.missions.length} of 7 missions complete</li>
            <li>{progress.projects.length} of {portfolio.projects.length} case studies read</li>
          </ul>
        </div>
        <h3 className="sc-dialog-sub">Badges</h3>
        <ul className="sc-badges">
          {BADGES.map((badge) => {
            const earned = badges.includes(badge.id);
            return (
              <li key={badge.id} className={earned ? "is-earned" : ""}>
                {earned ? <Award size={20} aria-hidden="true" /> : <Lock size={18} aria-hidden="true" />}
                <div>
                  <strong>{badge.name}</strong>
                  <span>{badge.description}</span>
                  <em>{earned ? "Earned" : "Locked"}</em>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="sc-actions">
          {!confirm ? (
            <button type="button" className="sc-btn is-quiet" onClick={() => setConfirm(true)}>Reset progress</button>
          ) : (
            <>
              <span className="sc-note">Clear all progress and badges?</span>
              <button type="button" className="sc-btn" onClick={() => { reset(); setConfirm(false); }}>Yes, reset</button>
              <button type="button" className="sc-btn is-quiet" onClick={() => setConfirm(false)}>Cancel</button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ToastStack = () => {
  const { toasts, dismissToast } = useCity();
  return (
    <div className="sc-toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => <BadgeToast key={toast.key} toastKey={toast.key} badgeId={toast.badge} onDismiss={dismissToast} />)}
    </div>
  );
};

const BadgeToast = ({ toastKey, badgeId, onDismiss }: { toastKey: string; badgeId: string; onDismiss: (key: string) => void }) => {
  const badge = BADGES.find((item) => item.id === badgeId);
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toastKey), 5200);
    return () => window.clearTimeout(timer);
  }, [toastKey, onDismiss]);
  if (!badge) return null;
  return (
    <div className="sc-toast" role="status">
      <Award size={22} aria-hidden="true" />
      <div><span>BADGE EARNED</span><strong>{badge.name}</strong></div>
      <button type="button" aria-label="Dismiss" onClick={() => onDismiss(toastKey)}><X size={14} /></button>
    </div>
  );
};
